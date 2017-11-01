const fs = require('fs');
const _ = require('lodash');
const getPixels = require('get-pixels');
const clusterfck = require('clusterfck');

let videosData = fs.readFileSync('./src/data/metadata.json');
videosData = JSON.parse(videosData);
const hasBorder = ["QUwxKWT6m7U", "nN6VR92V70M", "RzhAS_GnJIc", "cMPEd8m79Hw", "vNoKguSdy4Y",
  "QuijXg8wm28", "e-ORhEE9VVg", "QcIy9NiNbmo", "IdneKLhsWOQ", "JLf9q36UsBk", "7F37r50VUTQ", "3tmd-ClpJxA", "wIft-t-MQuE"];

const frameHeight = 25;
let videoId;
let videoFile;
let videoData;
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

  getPixels(`./screenshots/${videoId}/${image.screenshot}`, (err, pixels) => {
    if (err) return console.log(err);

    const [imageWidth, imageHeight, channels] = pixels.shape.slice();
    const shaveOff = imageWidth * frameHeight * 4;

    let imageData = pixels.data;
    if (_.includes(hasBorder, videoId)) {
      imageData = _.chain(pixels.data).dropRight(shaveOff).drop(shaveOff).value();
    }
    const colors = [];

    // get the colors
    for (let x = 0; x < imageWidth; x += 5) {
      for (let y = 0; y < (imageHeight - 2 * frameHeight); y += 5) {
        let offset = x * 4 + y * 4 * imageWidth;
        let color = [imageData[offset + 0], imageData[offset + 1], imageData[offset + 2]];
        if (color.join(',') !== '0,0,0') {
          colors.push(color);
        }
      }
    };

    let clusters = clusterfck.hcluster(colors, 'euclidean', 'complete', 25);
    let x = 0;
    clusters = _.map(clusters, hcluster => {
      var cluster = leaves(hcluster); // flatten the cluster
      var clusterSize = cluster.length;
      var colorAverage = _.map(cluster, 'value');
      colorAverage = [
        Math.floor(_.meanBy(colorAverage, color => color[0])),
        Math.floor(_.meanBy(colorAverage, color => color[1])),
        Math.floor(_.meanBy(colorAverage, color => color[2])),
      ];

      return {size: clusterSize, color: colorAverage};
    });

    // after getting cluster size and color, save it to image json
    image.colors = clusters;
    // save it to file
    fs.writeFileSync(videoFile, JSON.stringify({frames: videoData}));
    // go to next image
    index += 1;
    getColorsForImage(videoData[index]);
  });
}

// recursively go through cluster and get only the leaves
function leaves(hcluster) {
 // flatten cluster hierarchy
 if(!hcluster.left)
   return [hcluster];
 else
   return leaves(hcluster.left).concat(leaves(hcluster.right));
}

function processVideo(video) {
  videoId = video['Youtube Id'];
  videoFile = `./src/data/${videoId}.json`;
  videoData = fs.readFileSync(videoFile, 'utf-8');
  videoData = JSON.parse(videoData);
  videoData = videoData.frames;
  index = 0;

  console.log(videoId, videoFile, videoData.length, index);
  getColorsForImage(videoData[index]);
}

// const withSubtitles = ['3tmd-ClpJxA', '7F37r50VUTQ', 'VuNIsY6JdUw', 'wIft-t-MQuE', 'wyK7YuwUWsU'];
// videosData = _.filter(videosData, video => _.includes(withSubtitles, video['Youtube Id']));
let video = videosData.shift();
processVideo(video);
