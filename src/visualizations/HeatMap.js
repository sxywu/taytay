import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import chroma from 'chroma-js';

const hueDivider = 5;
const margin = {left: 5, top: 5, right: 5, bottom: 20};

class HeatMap extends Component {
  componentDidMount() {
    this.canvas = d3.select(this.refs.container);
    this.ctx = this.refs.container.getContext('2d');

    this.xScale = d3.scaleLinear().domain([0, 360])
      .range([margin.left, this.props.width - margin.right]);
    this.opacityScale = d3.scaleLinear().range([1, 100]);

    this.processData();
    this.renderData();
  }

  processData() {
    this.xScale.range([margin.left, this.props.width - margin.right]);

    const sumMax = _.chain(this.props.data).flatten().map('sum').max().value();
    this.opacityScale.domain([1, sumMax]);
  }

  renderData() {
    const colorWidth = this.xScale(hueDivider) - this.xScale(0);
    const colorHeight = this.props.height / this.props.data.length;
    _.each(this.props.data, (row, i) => {
      const y = i * colorHeight;
      _.each(row, column => {
        const opacity = this.opacityScale(column.sum) / 100;
        let color = chroma(column.hue, 0.75, 0.5, 'hsl').alpha(opacity).rgba();
        color = `rgba(${color})`;
        const x = this.xScale(column.hue);

        this.ctx.beginPath();
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = color;
        this.ctx.rect(x, y, colorWidth, colorHeight);
        this.ctx.fill();
        this.ctx.stroke();
      });
    });
  }

  render() {
    return (
      <canvas ref='container' width={this.props.width} height={this.props.height}/>
    );
  }
}

export default HeatMap;
