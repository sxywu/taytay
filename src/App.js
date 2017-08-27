import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import clusterfck from 'clusterfck';
import logo from './logo.svg';
import './App.css';

import imageUrl from './images/taytay.png';
var imageWidth = 848;
var imageHeight = 437;

class App extends Component {

  componentDidMount() {
    this.canvas = d3.select(this.refs.canvas);
    this.ctx = this.refs.canvas.getContext('2d');
    // set canvas width & height
    this.refs.canvas.width = 2 * imageWidth;
    this.refs.canvas.height = 2 * imageHeight;

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
          colors.push(color);
        }
      };
      // cluster the colors
      var clusters = clusterfck.hcluster(colors, 'euclidean', 'complete', 75);
      var x = 0;
      var swatchSize = 2;
      clusters = _.map(clusters, hcluster => {
        var cluster = this.leaves(hcluster); // flatten the cluster
        var groupWidth = Math.ceil(Math.sqrt(cluster.length));
        _.each(cluster, (leaf, i) => {
          var swatchX = x + (i % groupWidth) * swatchSize;
          var swatchY = imageHeight + Math.floor(i / groupWidth) * swatchSize;
          this.ctx.fillStyle = 'rgb(' + leaf.value + ')';
          this.ctx.fillRect(swatchX, swatchY, swatchSize, swatchSize);
        });
        x += groupWidth * swatchSize;
      });
      // draw the clusters

    }
    img.src = imageUrl;
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
      <div className="App">
        <canvas ref='canvas' />
      </div>
    );
  }
}

export default App;
