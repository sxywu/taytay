import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import clusterfck from 'clusterfck';

var imageWidth = 640;
var imageHeight = 480;

class Cluster extends Component {
  componentDidMount() {
    this.canvas = d3.select(this.refs.canvas);
    this.ctx = this.refs.canvas.getContext('2d');
    // set canvas width & height
    this.refs.canvas.width = 2 * imageWidth;
    this.refs.canvas.height = 1.25 * imageHeight;

    var img = new Image();
    img.onload = () => {
      this.ctx.drawImage(img, 0, 0, imageWidth, imageHeight);
      var data = this.ctx.getImageData(0, 0, imageWidth, imageHeight).data;
      var colors = [];
      // get the colors
      for (var x = 0; x < imageWidth; x += 12) {
        for (var y = 0; y < imageHeight; y += 12) {
          var offset = x * 4 + y * 4 * imageWidth;
          var color = [data[offset + 0], data[offset + 1], data[offset + 2]];
          if (color.join(',') !== '0,0,0') {
            colors.push(color);
          }
        }
      };
      // cluster the colors
      var clusters = clusterfck.hcluster(colors, 'euclidean', 'complete', 25);
      var x = 0;
      var swatchSize = 2;
      clusters = _.map(clusters, hcluster => {
        var cluster = this.leaves(hcluster); // flatten the cluster
        var groupWidth = Math.ceil(Math.sqrt(cluster.length));
        var clusterSize = cluster.length;
        var colorAverage = _.map(cluster, 'value');
        colorAverage = [
          Math.floor(_.meanBy(colorAverage, color => color[0])),
          Math.floor(_.meanBy(colorAverage, color => color[1])),
          Math.floor(_.meanBy(colorAverage, color => color[2])),
        ];
        // _.each(cluster, (leaf, i) => {
        //   // for each pixel? in the cluster, draw it
        //   var swatchX = x + (i % groupWidth) * swatchSize;
        //   var swatchY = imageHeight + Math.floor(i / groupWidth) * swatchSize;
        //   this.ctx.fillStyle = 'rgb(' + leaf.value + ')';
        //   this.ctx.fillRect(swatchX, swatchY, swatchSize, swatchSize);
        // });
        console.log(colorAverage);
        this.ctx.fillStyle = 'rgb(' + colorAverage + ')';
        this.ctx.fillRect(x, imageHeight, groupWidth * swatchSize, groupWidth * swatchSize);

        x += groupWidth * swatchSize;
      });

    }

    img.src = process.env.PUBLIC_URL + '/images/' + this.props.video.id + '.jpg';
  }

  leaves(hcluster) {
     // flatten cluster hierarchy
     if(!hcluster.left)
       return [hcluster];
     else
       return this.leaves(hcluster.left).concat(this.leaves(hcluster.right));
   }

  render() {
    return (
      <div className="Cluster">
        <h2>{this.props.video.snippet.title}</h2>
        <canvas ref='canvas' />
      </div>
    );
  }
}

export default Cluster;
