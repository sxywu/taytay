import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import chroma from 'chroma-js';

import Histogram from './visualizations/Histogram';
import HeatMap from './visualizations/HeatMap';
import FilterData from './FilterData';
const ratio = 180 / 320;

class Video extends Component {

  constructor(props) {
    super(props);
    this.state = {hoveredFrame: null};
  }

  componentDidMount() {
    this.ctx = this.refs.canvas.getContext('2d');
    this.renderImage();
  }

  componentDidUpdate() {
    this.renderImage();
  }

  hoverFrame = (frame) => {
    if (frame === this.state.hoveredFrame) return;
    if (!this.props.data.frames[frame]) {
      frame = null;
    }
    this.setState({hoveredFrame: frame});
  }

  renderImage = () => {
    const width = this.props.width;
    const height = Math.floor(this.props.width * ratio);
    const img = new Image();
    img.width = width;
    img.height = height;
    let imageIndex = _.isNull(this.state.hoveredFrame) ? 0 : this.state.hoveredFrame;
    let imageSrc = this.props.data.frames[imageIndex];
    img.src = `/images/${this.props.data.id}/${imageSrc.screenshot}`;

    const {hueRange, satRange, lightRange} = this.props.filters;

    img.onload = () => {
      this.ctx.drawImage(img, 0, 0);
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
    const style = {
      display: 'inline-block',
      width: this.props.width,
      margin: 'auto',
      textAlign: 'center',
      padding: 20,
      verticalAlign: 'top',
    };

    const histoProps = {
      groups: this.props.data.groupByHue,
      sumMax: d3.max(this.props.data.groupByHue, d => d.sum),
      numBlocks: 72,
      // legend: true,
      width: this.props.width,
      height: this.props.height,
    }
    if (!_.isNull(this.state.hoveredFrame)) {
      const sumMax = _.chain(this.props.data.frames).map('groupByHue')
        .flatten().maxBy('sum').value();
      Object.assign(histoProps, {
        groups: this.props.data.frames[this.state.hoveredFrame].groupByHue,
        sumMax: sumMax ? sumMax.sum : 0,
      });
    }

    const heatMapProps = {
      data: _.map(this.props.data.frames, 'groupByHue'),
      width: this.props.width,
      height: this.props.data.frames.length * 4,
      rowHeight: 7,
      numBlocks: 72,
      hoverRow: this.hoverFrame, // function
      hoveredRow: this.state.hoveredFrame, // index of row hovered
    }

    return (
      <div style={style}>
        <p><strong>{this.props.data.title}</strong></p>
        <canvas ref='canvas' width={this.props.width} height={this.props.width * ratio} />
        <Histogram {...histoProps} />
        <HeatMap {...heatMapProps} />
      </div>
    );
  }
}

export default Video;
