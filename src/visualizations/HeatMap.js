import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import chroma from 'chroma-js';

const margin = {left: 5, top: 5, right: 5, bottom: 5};

class HeatMap extends Component {
  componentDidMount() {
    this.canvas = d3.select(this.refs.container)
      .on('mousemove', this.hoverRow)
      .on('mouseleave', () => this.props.hoverRow(null));
    this.ctx = this.refs.container.getContext('2d');

    this.colorWidth = (this.props.width - margin.left - margin.right) / this.props.numBlocks;
    this.opacityScale = d3.scaleLinear().range([10, 100]);

    this.renderData();
    this.renderBorders();
  }

  renderData() {
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
        const x = column.key * this.colorWidth + margin.left;

        this.ctx.beginPath();
        this.ctx.fillStyle = color;
        this.ctx.rect(x, y, this.colorWidth, colorHeight);
        this.ctx.fill();
      });
    });
  }

  renderBorders() {
    const colorHeight = (this.props.height - margin.top - margin.bottom) / this.props.data.length;
    this.ctx.fillStyle = '#fcfcfc';

    _.times(this.props.data.length + 1, i => {
      const y = i * colorHeight + margin.top;
      this.ctx.clearRect(margin.left, y, this.props.width - margin.left - margin.right, 1);
      this.ctx.fillRect(margin.left, y, this.props.width - margin.left - margin.right, 1);
    });
  }

  hoverRow = () => {
    const colorHeight = (this.props.height - margin.top - margin.bottom) / this.props.data.length;

    const [x, y] = d3.mouse(this.refs.container);
    let frame = _.floor((y - margin.top) / colorHeight);

    this.props.hoverRow(frame);
  }

  render() {
    return (
      <canvas ref='container' width={this.props.width} height={this.props.height}/>
    );
  }
}

export default HeatMap;
