import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import chroma from 'chroma-js';

import FilterData from '../FilterData';
const ratio = 180 / 320;

class Screenshot extends Component {

  componentDidMount() {
    this.ctx = this.refs.canvas.getContext('2d');
    this.renderImage();
  }

  componentDidUpdate() {
    this.renderImage();
  }
  //
  // calculateColors() {
  //   const imageWidth = this.props.width;
  //   const imageHeight = Math.floor(width * ratio);
  //   for (let x = 0; x < imageWidth; x += 1) {
  //     for (let y = 0; y < imageHeight; y += 1) {
  //       let offset = x * 3 + y * 3 * imageWidth;
  //
  //     }
  //   };
  // }

  renderImage = () => {
    const {hueRange, satRange, lightRange} = this.props.filters;

    const pixels = this.props.colors;
    const imageWidth = this.props.width;
    const imageHeight = pixels.length / imageWidth / 3;
    const filteredImage = [];
    for (let x = 0; x < imageWidth; x += 1) {
      for (let y = 0; y < imageHeight; y += 1) {
        let offset = x * 3 + y * 3 * imageWidth;
        let color = [pixels[offset + 0], pixels[offset + 1], pixels[offset + 2]];

        const keepColor = FilterData.keepColor(color, hueRange, satRange, lightRange);

        if (!keepColor) {
          // if not keeping color turn it gray
          color = [color[0], 0, color[2]];
        }
        color = chroma(color[0], color[1], color[2], 'hsl').rgb();
        // offset = x * 4 + y * 4 * imageWidth;
        // filteredImage[offset + 0] = color[0];
        // filteredImage[offset + 1] = color[1];
        // filteredImage[offset + 2] = color[2];
        // filteredImage[offset + 3] = 255;
        filteredImage.push(color[0]);
        filteredImage.push(color[1]);
        filteredImage.push(color[2]);
        filteredImage.push(255);
      }
    };

    const imageData = new ImageData(new Uint8ClampedArray(filteredImage), imageWidth, imageHeight);
    this.ctx.putImageData(imageData, 0, 0);
    // img.onload = () => {
    //   this.ctx.drawImage(img, 0, 0, width, height);
    //   const imageData = this.ctx.getImageData(0, 0, width, height);
    //   const pixels = imageData.data;
    //
    //   // get the colors
    //   for (let x = 0; x < width; x += 1) {
    //     for (let y = 0; y < height; y += 1) {
    //       let offset = x * 4 + y * 4 * width;
    //       let color = [pixels[offset + 0], pixels[offset + 1], pixels[offset + 2]];
    //
    //       if (color.join(',') !== '0,0,0') {
    //         color = chroma(color).hsl();
    //
    //         const keepColor = FilterData.keepColor(color, hueRange, satRange, lightRange);
    //         if (!keepColor) {
    //           // if not keeping color turn it gray
    //           color = [color[0], 0, color[2]];
    //         }
    //         color = chroma(color[0], color[1], color[2], 'hsl').rgb();
    //         pixels[offset + 0] = color[0];
    //         pixels[offset + 1] = color[1];
    //         pixels[offset + 2] = color[2];
    //       }
    //     }
    //   };
    //
    //   this.ctx.putImageData(imageData, 0, 0);
    // }
  }

  render() {
    return (
      <canvas ref='canvas' width={this.props.width} height={this.props.height} />
    );
  }
}

export default Screenshot;
