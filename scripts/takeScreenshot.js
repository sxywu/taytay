const fs = require('fs');
const _ = require('lodash');
const vttToJson = require('vtt-to-json');
const ffmpeg = require('fluent-ffmpeg');
const getDuration = require('get-video-duration');

let videosData = fs.readFileSync('./src/data/metadata.json', 'utf-8');
videosData = JSON.parse(videosData);

function takeScreenshotForVideo(videoId, captions) {
  const timestamps = _.map(captions, caption => caption.middle / 1000);

  // create a directory for each video
  const outputDir = './screenshots/' + videoId;
  if (!fs.existsSync(outputDir)){
    fs.mkdirSync(outputDir);
  }

  ffmpeg('./videos/' + videoId + '.mp4')
    .on('filenames', (filenames) => {
      console.log('Will generate ' + filenames.length + ' files');
      // map each of the filenames to the corresponding caption
      _.each(captions, (caption, i) => {
        caption.screenshot = filenames[i];
      });
      // save that to a file
      fs.writeFileSync('./src/data/' + videoId + '.json', JSON.stringify(captions));
    })
    .on('end', () => {
      console.log('Screenshots taken');
      if (videosData.length) {
        // only take screenshot for next video if there are still any videos left
        const video = videosData.shift();
        processVideo(video);
      }
    })
    .on('error', (err) => {
      console.log('error: ', err.message);
    })
    .screenshots({
      timestamps,
      filename: '%f-at-%s.png',
      folder: outputDir,
      size: '320x180',
    });
}

function processVideo(video) {
  const videoId = video['Youtube Id'];
  const vttPath = './videos/' + videoId + '.en.vtt';

  if (fs.existsSync(vttPath)) {
    // if caption file exists
    const vttString = fs.readFileSync(vttPath, 'utf-8');
    vttToJson(vttString)
      .then(result => {
        // get timestamp out of caption file
        // and take the average of start and end of each caption
        const captions = _.chain(result)
          .filter(caption => caption.part)
          .map(caption => {
            var {start, end, part} = caption;
            var middle = (start + end) / 2;
            return {start, middle, end, caption: part};
          }).value();

        takeScreenshotForVideo(videoId, captions);
      }).catch(e => {
        console.log(e);
      });
  } else {
    const videoPath = './videos/' + videoId + '.mp4';
    getDuration(videoPath).then(duration => {
      // take a screenshot every 5 seconds
      const frequency = 5;
      const captions = _.times(Math.floor(duration / frequency) - 1, i => {
        return {middle: (i + 1) * frequency * 1000};
      });

      takeScreenshotForVideo(videoId, captions);
    });
  }
}

const video = videosData.shift();
processVideo(video);
