const fs = require('fs');
const _ = require('lodash');
const getPixels = require('get-pixels');
const clusterfck = require('clusterfck');

const videoId = 'VuNIsY6JdUw';
const videoFile = `./src/data/${videoId}.json`;
let videoData = fs.readFileSync(videoFile, 'utf-8');
videoData = JSON.parse(videoData);

let index = 0; // keeping track of which screenshot we're at
function getColorsForImage(image) {
  // if we've gone through all the images for video then stop
  if (index === videoData.length) return;

  getPixels(`./screenshots/${videoId}/${image.screenshot}`, (err, pixels) => {
    if (err) return console.log(err);

    const [imageWidth, imageHeight, channels] = pixels.shape.slice();
    const imageData = pixels.data;
    const colors = [];

    // get the colors
    for (let x = 0; x < imageWidth; x += 1) {
      for (let y = 0; y < imageHeight; y += 1) {
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
    fs.writeFileSync(videoFile, JSON.stringify(videoData));
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

getColorsForImage(videoData[index])
