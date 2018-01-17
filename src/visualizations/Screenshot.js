import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import chroma from 'chroma-js';
import GPU from 'gpu.js';

import FilterData from '../FilterData';
const ratio = 180 / 320;
const imageWidth = 160;
const imageHeight = imageWidth * ratio;

const gpu = new GPU();
function rgb2l(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  var min = r;
  if (g < min) {
    min = g;
  }
  if (b < min) {
    min = b;
  }
  var max = r;
  if (g > max) {
    max = g;
  }
  if (b > max) {
    max = b;
  }

  return (min + max) / 2;
}

function rgb2s(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  var min = r;
  if (g < min) {
    min = g;
  }
  if (b < min) {
    min = b;
  }
  var max = r;
  if (g > max) {
    max = g;
  }
  if (b > max) {
    max = b;
  }

  var s = 0;
  if (min !== max) {
    if ((min + max) / 2 < 0.5) {
      s = (max - min) / (max + min);
    } else {
      s = (max - min) / (2 - max - min);
    }
  }
  return s;
}

function rgb2h(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  var min = r;
  if (g < min) {
    min = g;
  }
  if (b < min) {
    min = b;
  }
  var max = r;
  if (g > max) {
    max = g;
  }
  if (b > max) {
    max = b;
  }

  var h = 0;
  // calculate hue
  if (r === max) {
    h = (g - b) / (max - min);
  } else if (g == max) {
    h = 2 + (b - r) / (max - min);
  } else if (b == max) {
    h = 4 + (r - g) / (max - min);
  }
  h *= 60;
  if (h < 0) {
    h += 360;
  }
  return h;
}

function keepColor(h, s, l, hueRange, satRange, lightRange) {
  // in saturation range
  if (s < satRange[0]) return 0;
  if (satRange[1] < s) return 0;
  // in lightness range
  if (l < lightRange[0]) return 0;
  if (lightRange[1] < l) return 0;
  // now see if in hue range
  if (hueRange[0] > hueRange[1]) {
    // if it wraps around
    var keep = 0;
    if (hueRange[0] <= h) keep += 1;
    if (h <= hueRange[1]) keep += 1;
    if (keep < 2) return 0;
  } else {
    if (h < hueRange[0]) return 0;
    if (hueRange[1] < h) return 0;
  }
  return 1;
}

const filterImage = gpu.createKernel(function(pixels, imageWidth, hueRange, satRange, lightRange) {
  var x = this.thread.y;
  var y = this.thread.z;
  var index = this.thread.x;
  var offset = x * 4 + y * 4 * imageWidth;
  var r = pixels[offset];
  var g = pixels[offset + 1];
  var b = pixels[offset + 2];

  var h = rgb2h(r, g, b);
  var s = rgb2s(r, g, b);
  var l = rgb2l(r, g, b);
  var keep = keepColor(h, s, l, hueRange, satRange, lightRange);

  if (index === 3) return 255;
  if (keep === 1) return pixels[offset + index];
  return 0.21 * r + 0.72 * g + 0.07 * b;
}).setOutput([4, imageWidth, imageHeight])
  .setFunctions([rgb2h, rgb2s, rgb2l, keepColor]);

class Screenshot extends Component {

  constructor(props) {
    super(props);
    this.state = {imageData: null, filteredImageData: new ImageData(imageWidth, imageHeight)};
  }

  componentDidMount() {
    this.ctx = this.refs.canvas.getContext('2d');
    const img = new Image(imageWidth, imageHeight);
    img.src = `${process.env.PUBLIC_URL}/images/${this.props.videoId}/${this.props.screenshot}`;

    img.onload = () => {
      this.ctx.drawImage(img, 0, 0, imageWidth, imageHeight);
      const imageData = this.ctx.getImageData(0, 0, imageWidth, imageHeight);

      this.renderImage(imageData);
      this.setState({imageData});

    };

  }

  componentDidUpdate() {
    this.renderImage(this.state.imageData);
  }

  renderImage = (imageData) => {
    const {hueRange, satRange, lightRange} = this.props.filters;
    let pixels = filterImage(imageData.data, imageWidth, hueRange, satRange, lightRange);
    pixels = _.flattenDeep(pixels);
    this.state.filteredImageData.data.set(pixels);
    this.ctx.putImageData(this.state.filteredImageData, 0, 0);
  }

  render() {
    return (
      <span>
        <canvas ref='canvas' width={imageWidth} height={imageHeight} />
      </span>
    );
  }
}

export default Screenshot;
