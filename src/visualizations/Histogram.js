import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import chroma from 'chroma-js';

const hue = 0;
const saturation = 1;
const lightness = 2;

const margin = {left: 5, top: 5, right: 5, bottom: 20};

class Histogram extends Component {

  componentDidMount() {
    this.canvas = d3.select(this.refs.container);
    this.ctx = this.refs.container.getContext('2d');
    this.heightScale = d3.scaleLinear();

    this.processData();
    this.renderData();
    this.props.legend && this.renderLegend();
    this.renderLine();
  }

  componentDidUpdate() {
    this.processData();
    this.renderData();
    this.props.legend && this.renderLegend();
    this.renderLine();
  }

  processData() {
    this.colorWidth = (this.props.width - margin.left - margin.right) / this.props.numBlocks;

    const sumMax = d3.max(this.props.groups, d => d.sum);
    let heightMax = this.props.height - margin.top;
    if (this.props.legend) {
      heightMax = heightMax - margin.top - margin.bottom;
    }
    this.heightScale.domain([0, sumMax]).range([0, heightMax]);
  }

  renderData() {
    _.each(this.props.groups, group => {
      const x = group.key * this.colorWidth + margin.left;
      let y = this.props.height - (this.props.legend ? margin.bottom : 0);
      _.each(group.values, value => {
        const colorHeight = this.heightScale(value.size);
        y -= colorHeight;
        const color = chroma(value.color[0], value.color[1], value.color[2], 'hsl');

        this.ctx.beginPath();
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = color;
        this.ctx.rect(x, y, this.colorWidth, colorHeight);
        this.ctx.fill();
        this.ctx.stroke();
      });

      this.ctx.clearRect(x - 1, 0, 1, this.props.height);
      this.ctx.clearRect(x + this.colorWidth - 0.25, 0, this.props.width, this.props.height);
    });
  }

  renderLegend() {
    // color legend under chart
    const y = this.props.height - 1 * margin.bottom + 2;
    const colorHeight = 0.75 * this.colorWidth;
    _.each(this.props.groups, group => {
      const color = chroma(group.hue, 0.75, group.lightness || 0.5, 'hsl');
      const x = group.key * this.colorWidth + margin.left;

      this.ctx.beginPath();
      this.ctx.fillStyle = color;
      this.ctx.rect(x, y, this.colorWidth, colorHeight);
      this.ctx.fill();

      this.ctx.clearRect(x - 1, y, 1, colorHeight);
      this.ctx.clearRect(x + this.colorWidth - 0.25, y, this.props.width, colorHeight);
    });
  }

  renderLine() {
    // draw line under chart
    this.ctx.beginPath();
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    this.ctx.fillRect(margin.left, this.props.height - (this.props.legend ? margin.bottom : 1),
      this.props.width - margin.left - margin.right, 1);
  }

  render() {
    return (
      <canvas ref='container' width={this.props.width} height={this.props.height} />
    );
  }
}

export default Histogram;
