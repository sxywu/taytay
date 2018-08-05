import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import chroma from 'chroma-js';

import FilterData from '../FilterData';
const ratio = 180 / 320;
const imageWidth = 160;
const imageHeight = imageWidth * ratio;
const barWidth = 6;

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
      }).on('mouseover', (frame, index) => this.props.hoverFrame(index));
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

    if (this.props.updateFilters) {
      this.barsData = [];
      _.each(this.props.frames, frame => this.barsData.push(this.calculateBars(frame)));

      this.postWorkerMessage();
    } else {
      this.renderHovered();
    }
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
    _.each(event.data.allImagesPixels, (pixels, index) => {
      // set the filtered image data to state
      const filteredImageDatum = this.state.filteredImageData[index];
      filteredImageDatum.data.set(pixels);
    });

    const self = this;
    this.canvases.attr('width', barWidth).style('display', 'inline-block')
      .each(function(frame, index) {
        const ctx = this.getContext('2d');
        ctx.clearRect(0, 0, barWidth, imageHeight);
        self.renderBars(ctx, self.barsData[index]);
      });

    this.renderHovered();
  }

  renderHovered() {
    const padding = 2;

    // set the previously hovered frame back to just the bars
    const prevCanvas = this.canvases.nodes()[this.props.prevHovered];
    d3.select(prevCanvas).attr('width', barWidth);
    const prevCtx = prevCanvas.getContext('2d');
    prevCtx.clearRect(0, 0, barWidth, imageHeight);
    this.renderBars(prevCtx, this.barsData[this.props.prevHovered]);

    const filteredImageDatum = this.state.filteredImageData[this.props.hoveredFrame];
    if (!filteredImageDatum) return;
    const imageDatum = this.state.imageData[this.props.hoveredFrame];

    // hovered frame: clear it and then draw image
    const hoveredCanvas = this.canvases.nodes()[this.props.hoveredFrame];
    d3.select(hoveredCanvas).attr('width', 2 * imageWidth + 2 * padding);
    const hoveredCtx = hoveredCanvas.getContext('2d');
    hoveredCtx.clearRect(0, 0, 2 * imageWidth, imageHeight);
    hoveredCtx.putImageData(imageDatum, padding, 0);
    hoveredCtx.putImageData(filteredImageDatum, imageWidth + padding, 0);
  }


  // calculate all colors that aren't filtered out for given frame
  calculateBars(frame) {
    const totalCount = frame.totalCount;
    let y = imageHeight;
    return _.chain(frame.colors)
      .filter(color => color.keep)
      .sortBy(color => -color.color[2])
      .map(color => {
        let height = (color.size / totalCount) * (1 * imageHeight);
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
      // ctx.clearRect(0, 0, 1, imageHeight);
    });
  }

  render() {
    const style = {
      display: 'inline-block',
      textAlign: 'left'
    };

    return (
      <span ref='container' style={style} />
    );
  }
}

export default Screenshot;
