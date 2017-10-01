const fs = require('fs');
const _ = require('lodash');
const getPixels = require('get-pixels');
const clusterfck = require('clusterfck');

const videoId = 'VuNIsY6JdUw';
let videoData = fs.readFileSync(`./data/${videoId}.json`, 'utf-8');
videoData = JSON.parse(videoData);

getPixels(`./screenshots/${videoId}/${videoData[0].screenshot}`, (err, pixels) => {
  if (err) return console.log(err);

  const [imageWidth, imageHeight, channels] = pixels.shape.slice();
  const imageData = pixels.data;
  const colors = [];

  // get the colors
  for (let x = 0; x < imageWidth; x += 12) {
    for (let y = 0; y < imageHeight; y += 12) {
      let offset = x * 4 + y * 4 * imageWidth;
      let color = [imageData[offset + 0], imageData[offset + 1], imageData[offset + 2]];
      if (color.join(',') !== '0,0,0') {
        colors.push(color);
      }
    }
  };

  var clusters = clusterfck.hcluster(colors, 'euclidean', 'complete', 25);
  var x = 0;
  clusters = _.map(clusters, hcluster => {
    var cluster = leaves(hcluster); // flatten the cluster
    var clusterSize = cluster.length;
    var colorAverage = _.map(cluster, 'value');
    colorAverage = [
      Math.floor(_.meanBy(colorAverage, color => color[0])),
      Math.floor(_.meanBy(colorAverage, color => color[1])),
      Math.floor(_.meanBy(colorAverage, color => color[2])),
    ];
    console.log(clusterSize, colorAverage);
  });
});

// recursively go through cluster and get only the leaves
function leaves(hcluster) {
 // flatten cluster hierarchy
 if(!hcluster.left)
   return [hcluster];
 else
   return leaves(hcluster.left).concat(leaves(hcluster.right));
}
