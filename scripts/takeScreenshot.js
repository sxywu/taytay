const fs = require('fs');
const _ = require('lodash');
const vttToJson = require('vtt-to-json');
const ffmpeg = require('fluent-ffmpeg');

let videoId = 'VuNIsY6JdUw'; // You Belong With Me
let vttString = fs.readFileSync('./videos/' + videoId + '.en.vtt', 'utf-8');

vttToJson(vttString)
  .then(result => {
    // get timestamp out of caption file
    // and take the average of start and end of each caption
    var captions = _.chain(result)
      .filter(caption => caption.part)
      .map(caption => {
        var {start, end, part} = caption;
        var middle = (start + end) / 2;
        return {start, middle, end, caption: part};
      }).value();
    var timestamps = _.map(captions, caption => caption.middle / 1000);

    // create a directory for each video
    var outputDir = './screenshots/' + videoId;
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
        fs.writeFileSync('./data/' + videoId + '.json', JSON.stringify(captions));
      })
      .on('end', () => {
        console.log('Screenshots taken');
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
  }).catch(e => {
    console.log(e);
  });
