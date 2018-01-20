import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import GPU from 'gpu.js';

import FilterData from '../FilterData';
const ratio = 180 / 320;
const imageWidth = 160;
const imageHeight = imageWidth * ratio;

class Screenshot extends Component {

  constructor(props) {
    super(props);

    this.state = {imageData: null, filteredImageData: new ImageData(imageWidth, imageHeight)};
  }

  componentDidMount() {
    this.worker = new Worker(`${process.env.PUBLIC_URL}/FilterImage-worker.js`);
    this.worker.onmessage = (event) => {
      let pixels = event.data.pixels;
      pixels = _.flattenDeep(pixels);
      this.state.filteredImageData.data.set(pixels);
      this.ctx.putImageData(this.state.filteredImageData, 0, 0);
    }

    this.ctx = this.refs.canvas.getContext('2d');
    const img = new Image(imageWidth, imageHeight);
    img.src = `${process.env.PUBLIC_URL}/images/${this.props.videoId}/${this.props.screenshot}`;

    img.onload = () => {
      this.ctx.drawImage(img, 0, 0, imageWidth, imageHeight);
      const imageData = this.ctx.getImageData(0, 0, imageWidth, imageHeight);

      this.worker.postMessage({
        imageData,
        imageWidth,
        imageHeight,
        filters: this.props.filters,
      });

      this.setState({imageData});
    };
  }

  componentDidUpdate() {
    if (!this.state.imageData) return;

    this.worker.postMessage({
      imageData: this.state.imageData,
      imageWidth,
      imageHeight,
      filters: this.props.filters,
    });
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
