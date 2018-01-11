const fs = require('fs');
const _ = require('lodash');
const Jimp = require('jimp');
const getPixels = require('get-pixels');
const chroma = require('chroma-js');

let videosData = fs.readFileSync('./src/data/metadata.json');
videosData = JSON.parse(videosData);

let videoId;
let videoFile;
let videoData;
let videoFrames = []; // array of arrays, where inner array is frames' hsl
let index = 0; // keeping track of which screenshot we're at
function getColorsForImage(image) {
  console.log(`\timage: ${index}`);
  if (index === videoData.length) {
    // if we've gone through all the images for video then go to next video
    if (videosData.length) {
      const video = videosData.shift();
      processVideo(video);
    }
    return;
  };

  const frameColors = [];
  Jimp.read(`./screenshots/${videoId}/${image.screenshot}`, (err, screenshot) => {
    if (err) throw err;

    screenshot.resize(90, Jimp.AUTO)
      .write(`./screenshots.compressed/${videoId}/${image.screenshot}`, () => {
        getPixels(`./screenshots.compressed/${videoId}/${image.screenshot}`, (err, pixels) => {
          if (err) return console.log(err);

          const [imageWidth, imageHeight, channels] = pixels.shape.slice();
          // get the colors, convert them to hsl, and save them
          for (let x = 0; x < imageWidth; x += 1) {
            for (let y = 0; y < imageHeight; y += 1) {
              let offset = x * 4 + y * 4 * imageWidth;
              let color = chroma(
                pixels.data[offset + 0],
                pixels.data[offset + 1],
                pixels.data[offset + 2]
              ).hsl();
              frameColors.push(_.round(color[0]) || 0);
              frameColors.push(_.round(color[1], 2));
              frameColors.push(_.round(color[2], 2));
            }
          };

          videoFrames.push(frameColors);
          // save it to file
          fs.writeFileSync(`./src/hsl/${videoId}.json`, JSON.stringify(videoFrames));
          // go to next image
          index += 1;
          getColorsForImage(videoData[index]);
        });
      });
  });
}

function processVideo(video) {
  videoId = video['Youtube Id'];
  videoFile = `./src/data/${videoId}.json`;
  videoData = fs.readFileSync(videoFile, 'utf-8');
  videoData = JSON.parse(videoData);
  videoData = videoData.frames;
  videoFrames = [];
  index = 0;

  // create a directory for compressed images
  const outputDir = './screenshots.compressed/' + videoId;
  if (!fs.existsSync(outputDir)){
    fs.mkdirSync(outputDir);
  }

  console.log(videoId, videoFile, videoData.length, index);
  getColorsForImage(videoData[index]);
}

// const withSubtitles = ['3tmd-ClpJxA', '7F37r50VUTQ', 'VuNIsY6JdUw', 'wIft-t-MQuE', 'wyK7YuwUWsU'];
// videosData = _.filter(videosData, video => _.includes(withSubtitles, video['Youtube Id']));
let video = videosData.shift();
processVideo(video);
