import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import chroma from 'chroma-js';

import FilterData from '../FilterData';
const ratio = 180 / 320;
const imageWidth = 240;
const imageHeight = imageWidth * ratio;
const barWidth = 8;

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
    this.barsData = [];
    const self = this;
    this.canvases = this.container.selectAll('canvas')
      .data(this.props.frames).enter().append('canvas')
      .attr('width', imageWidth).attr('height', imageHeight)
      .style('display', 'none').style('cursor', 'pointer')
      .each(function(frame, index) {
        const ctx = this.getContext('2d');

        self.barsData.push(self.calculateBars(frame));
        // get image data
        const img = new Image(imageWidth, imageHeight);
        img.src = `${process.env.PUBLIC_URL}/images/${self.props.videoId}/${frame.screenshot}`;
        img.onload = self.onImageLoad.bind(self, index, ctx, img);
      }).on('mouseover', function(frame, index) { return self.onMouseover(this, index); })
      .on('mouseleave', function(frame, index) { return self.onMouseleave(this, index); });
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
    this.barsData = [];
    _.each(this.props.frames, frame => this.barsData.push(this.calculateBars(frame)));

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
    const canvasEls = this.canvases.attr('width', barWidth)
      .style('display', 'inline-block').nodes();

    _.each(event.data.allImagesPixels, (pixels, index) => {
      // set the filtered image data to state
      const filteredImageDatum = this.state.filteredImageData[index];
      filteredImageDatum.data.set(pixels);
      // draw only the bars at first
      const ctx = canvasEls[index].getContext('2d');
      ctx.clearRect(0, 0, barWidth, imageHeight);
      this.renderBars(ctx, this.barsData[index]);
    });
  }

  // calculate all colors that aren't filtered out for given frame
  calculateBars(frame) {
    const totalCount = frame.totalCount;
    let y = imageHeight;
    return _.chain(frame.colors)
      .filter(color => color.keep)
      .sortBy(color => -color.color[2])
      .map(color => {
        let height = (color.size / totalCount) * (0.75 * imageHeight);
        y = y - height;
        height += 1;
        return {height, y, color: color.color};
      }).value();
  }

  // render all colors that aren't filtered
  renderBars(ctx, bars) {
    _.each(bars, bar => {
      ctx.fillStyle = chroma(bar.color[0], bar.color[1], bar.color[2], 'hsl').css();
      ctx.fillRect(0, bar.y, barWidth, bar.height);
    });
  }

  onMouseover = (canvas, index) => {
    const filteredImageDatum = this.state.filteredImageData[index];
    if (!filteredImageDatum) return;
    // if there is the data, expand

    const padding = 2;
    d3.select(canvas).attr('width', imageWidth + 2 * padding)
      .attr('height', imageHeight);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, imageWidth, imageHeight);
    ctx.putImageData(filteredImageDatum, padding, 0);
  }

  onMouseleave = (canvas, index) => {
    d3.select(canvas).attr('width', barWidth);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, barWidth, imageHeight);
    this.renderBars(ctx, this.barsData[index]);
  }

  render() {
    const style = {
      display: 'inline-block',
      width: 5 * imageWidth,
      textAlign: 'left'
    };

    return (
      <span ref='container' style={style} />
    );
  }
}

export default Screenshot;
