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

    this.state = {
      imageData: [],
      filteredImageData: [],
    };

    this.worker = new Worker(`${process.env.PUBLIC_URL}/FilterImage-worker.js`);
    this.worker.onmessage = this.onWorkerMessage;
  }

  componentDidMount() {
    this.container = d3.select(this.refs.container);
    // make a canvas for each screenshot
    _.each(this.props.frames, (frame, index) => {
      const canvas = this.container.append('canvas')
        .attr('width', imageWidth).attr('height', imageHeight).node();
      const ctx = canvas.getContext('2d');
      const img = new Image(imageWidth, imageHeight);
      img.src = `${process.env.PUBLIC_URL}/images/${this.props.videoId}/${frame.screenshot}`;

      img.onload = this.onImageLoad.bind(this, index, ctx, img);
    });
  }

  onImageLoad = (index, ctx, img) => {
    ctx.drawImage(img, 0, 0, imageWidth, imageHeight);
    const imageData = ctx.getImageData(0, 0, imageWidth, imageHeight);

    this.state.imageData[index] = imageData;
    this.state.filteredImageData[index] = new ImageData(imageWidth, imageHeight);

    // if all the images have been loaded
    if (_.filter(this.state.imageData).length === this.props.frames.length) {
      this.postWorkerMessage();
    }
  }

  componentDidUpdate() {
    if (!this.state.imageData) return;
    this.postWorkerMessage();
  }

  postWorkerMessage = () => {
    this.worker.postMessage({
      imageData: this.state.imageData,
      imageWidth,
      imageHeight,
      filters: this.props.filters,
    });
  }

  onWorkerMessage = (event) => {
    const canvases = this.container.selectAll('canvas').nodes();
    _.each(event.data.allImagesPixels, (pixels, index) => {
      // pixels = _.flattenDeep(pixels);
      const filteredImageDatum = this.state.filteredImageData[index];
      filteredImageDatum.data.set(pixels);
      canvases[index].getContext('2d').putImageData(filteredImageDatum, 0, 0);
    });
  }

  render() {
    const style = {
      display: 'inline-block',
      width: 5 * imageWidth,
      textAlign: 'left'
    };

    return (
      <div ref='container' style={style} />
    );
  }
}

export default Screenshot;
