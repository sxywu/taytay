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

  renderImage = () => {
    const width = this.props.width;
    const height = Math.floor(width * ratio);
    const img = new Image(width, height);
    img.src = `/images/${this.props.videoId}/${this.props.screenshot}`;

    const {hueRange, satRange, lightRange} = this.props.filters;

    img.onload = () => {
      this.ctx.drawImage(img, 0, 0, width, height);
      const imageData = this.ctx.getImageData(0, 0, width, height);
      const pixels = imageData.data;

      // get the colors
      for (let x = 0; x < width; x += 1) {
        for (let y = 0; y < height; y += 1) {
          let offset = x * 4 + y * 4 * width;
          let color = [pixels[offset + 0], pixels[offset + 1], pixels[offset + 2]];

          if (color.join(',') !== '0,0,0') {
            color = chroma(color).hsl();

            const keepColor = FilterData.keepColor(color, hueRange, satRange, lightRange);
            if (!keepColor) {
              // if not keeping color turn it gray
              color = [color[0], 0, color[2]];
            }
            color = chroma(color[0], color[1], color[2], 'hsl').rgb();
            pixels[offset + 0] = color[0];
            pixels[offset + 1] = color[1];
            pixels[offset + 2] = color[2];
          }
        }
      };

      this.ctx.putImageData(imageData, 0, 0);
    }
  }

  render() {
    return (
      <canvas ref='canvas'
        width={this.props.width} height={this.props.width * ratio} />
    );
  }
}

export default Screenshot;
