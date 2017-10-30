import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import chroma from 'chroma-js';

const hue = 0;
const saturation = 1;
const lightness = 2;

const margin = {left: 5, top: 5, right: 5, bottom: 20};
const hueDivider = 5;

class Histogram extends Component {

  componentDidMount() {
    this.canvas = d3.select(this.refs.container);
    this.ctx = this.refs.container.getContext('2d');

    this.xScale = d3.scaleLinear().domain([0, 360]);
    this.heightScale = d3.scaleLinear();

    this.processData();
    this.renderData();
    this.renderLegend();
  }

  componentDidUpdate() {
    this.processData();
    this.renderData();
    this.renderLegend();
  }

  processData() {
    this.xScale.range([margin.left, this.props.width - margin.right]);

    const sumMax = d3.max(this.props.groups, d => d.sum);
    this.heightScale.domain([0, sumMax])
      .range([0, this.props.height - margin.top - margin.bottom]);
  }

  renderData() {
    const colorWidth = this.xScale(hueDivider) - this.xScale(0);
    _.each(this.props.groups, group => {
      const x = this.xScale(group.hue);
      let y = this.props.height - margin.bottom;
      _.each(group.values, value => {
        const colorHeight = this.heightScale(value.size);
        y -= colorHeight;
        const color = chroma(value.color[0], value.color[1], value.color[2], 'hsl');

        this.ctx.beginPath();
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = color;
        this.ctx.rect(x, y, colorWidth, colorHeight);
        this.ctx.fill();
        this.ctx.stroke();
      });

      this.ctx.clearRect(x - 1, 0, 1, this.props.height);
      this.ctx.clearRect(x + colorWidth - 0.25, 0, this.props.width, this.props.height);
    });
  }

  renderLegend() {
    // color legend under chart
    const y = this.props.height - 1 * margin.bottom + 2;
    const colorWidth = this.xScale(hueDivider) - this.xScale(0);
    const colorHeight = 0.75 * colorWidth;
    _.each(this.props.groups, group => {
      const color = chroma(group.hue, 0.75, 0.5, 'hsl');
      const x = this.xScale(group.hue);

      this.ctx.beginPath();
      this.ctx.fillStyle = color;
      this.ctx.rect(x, y, colorWidth, colorHeight);
      this.ctx.fill();

      this.ctx.clearRect(x - 1, y, 1, colorHeight);
      this.ctx.clearRect(x + colorWidth - 0.25, y, this.props.width, colorHeight);
    });

    // draw line under chart
    this.ctx.beginPath();
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(margin.left, this.props.height - margin.bottom,
      this.props.width - margin.left - margin.right, 1);
  }

  render() {
    return (
      <canvas ref='container' width={this.props.width} height={this.props.height} />
    );
  }
}

export default Histogram;
