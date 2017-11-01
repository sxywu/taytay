const fs = require('fs');
const _ = require('lodash');
const clusterfck = require('clusterfck');

let videosData = fs.readFileSync('./src/data/metadata.json', 'utf-8');
videosData = JSON.parse(videosData);
let allColors = {};
const allClusterSizes = {};

function processVideoColors(video) {
  const videoId = video['Youtube Id'];
  const videoFile = `./src/data/${videoId}.json`;
  let videoData = fs.readFileSync(videoFile, 'utf-8');
  videoData = JSON.parse(videoData);
  videoData = videoData.frames;

  let colors = {};
  const clusterSizes = {};
  _.each(videoData, frame => {
    _.each(frame.colors, color => {
      if (!clusterSizes[color.color]) {
        colors[color.color] = color.color;
        clusterSizes[color.color] = 0;
      }
      clusterSizes[color.color] += color.size;
    });
  });
  colors = _.values(colors);

  const clusters = clusterColors(colors, clusterSizes);

  _.each(clusters, color => {
    // and do the same thing for all videos together
    if (!allClusterSizes[color.color]) {
      allColors[color.color] = color.color;
      allClusterSizes[color.color] = 0;
    }
    allClusterSizes[color.color] += color.size;
  });

  // after getting cluster size and color, save it to image json
  console.log('clusters', videoId, clusters.length, _.size(allColors))
  // save it to file
  fs.writeFileSync(videoFile, JSON.stringify({colors: clusters, frames: videoData}));

  if (videosData.length) {
    video = videosData.shift();
    processVideoColors(video);
  } else {
    // and if it's done, then do same cluster analysis
    console.log('all videos', allColors.length, _.size(allClusterSizes));
    allColors = _.values(allColors);
    const allClusters = clusterColors(allColors, allClusterSizes);
    fs.writeFileSync('./src/data/allColors.json', JSON.stringify(allClusters));
  }
}

function clusterColors(colors, clusterSizes) {
  let clusters = clusterfck.hcluster(colors, 'euclidean', 'complete', 25);
  let x = 0;

  return _.map(clusters, hcluster => {
    const cluster = leaves(hcluster); // flatten the cluster
    const clusterSize = _.sumBy(cluster, color => clusterSizes[color.value]);
    let colorAverage = _.map(cluster, 'value');
    colorAverage = [
      Math.floor(_.meanBy(colorAverage, color => color[0])),
      Math.floor(_.meanBy(colorAverage, color => color[1])),
      Math.floor(_.meanBy(colorAverage, color => color[2])),
    ];

    return {size: clusterSize, color: colorAverage};
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

let video = videosData.shift();
processVideoColors(video);
