import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import chroma from 'chroma-js';

const margin = {left: 5, top: 5, right: 5, bottom: 5};

class HeatMap extends Component {
  componentDidMount() {
    this.canvas = d3.select(this.refs.container);
    this.ctx = this.refs.container.getContext('2d');

    this.maxDomain = 360;
    this.divider = 5;
    if (!this.props.hue) {
      this.maxDomain = 1;
      this.divider = 0.025;
    }
    this.xScale = d3.scaleLinear().domain([0, this.maxDomain])
      .range([margin.left, this.props.width - margin.right]);
    this.opacityScale = d3.scaleLinear().range([1, 100]);

    this.renderData();
    this.props.border && this.renderBorders();
  }

  renderData() {
    const colorWidth = this.xScale(this.divider) - this.xScale(0);
    const colorHeight = (this.props.height - margin.top - margin.bottom) / this.props.data.length;
    _.each(this.props.data, (row, i) => {
      const y = i * colorHeight + margin.top;
      const maxSum = d3.max(row, d => d.sum);
      this.opacityScale.domain([1, maxSum]);

      _.each(row, column => {
        const opacity = this.opacityScale(column.sum) / 100;
        let color = _.maxBy(column.values, value => value.size);
        color = chroma(color.color[0], color.color[1], color.color[2], 'hsl');
        // color = `rgba(${color.alpha(opacity).rgba()})`;

        let x = this.xScale(column.hue);
        if (!this.props.hue) {
          x = this.xScale(column.lightness);
        }

        this.ctx.beginPath();
        this.ctx.fillStyle = color;
        this.ctx.rect(x, y, colorWidth, colorHeight);
        this.ctx.fill();
      });
    });
  }

  renderBorders() {
    const colorWidth = this.xScale(this.divider) - this.xScale(0);
    const colorHeight = (this.props.height - margin.top - margin.bottom) / this.props.data.length;
    this.ctx.fillStyle = '#fcfcfc';

    _.times(this.props.data.length + 1, i => {
      const y = i * colorHeight + margin.top;
      this.ctx.clearRect(margin.left, y, this.props.width - margin.left - margin.right, 1);
      this.ctx.fillRect(margin.left, y, this.props.width - margin.left - margin.right, 1);
    });
    _.times(this.maxDomain / this.divider + 1, i => {
      const x = this.xScale(i * this.divider);
      this.ctx.clearRect(x, margin.top, 1, this.props.height - margin.top - margin.bottom);
      this.ctx.fillRect(x, margin.top, 1, this.props.height - margin.top - margin.bottom);
    });
  }

  render() {
    return (
      <canvas ref='container' width={this.props.width} height={this.props.height}/>
    );
  }
}

export default HeatMap;
