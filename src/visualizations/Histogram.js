import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import chroma from 'chroma-js';

const hue = 0;
const saturation = 1;
const lightness = 2;

const histoWidth = 360;
const histoHeight = 90;
const margin = {left: 0, top: 5, right: 5, bottom: 20};

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
    this.ctx.clearRect(0, 0, histoWidth, histoHeight);
    this.processData();
    this.renderData();
    this.props.legend && this.renderLegend();
    this.renderLine();
  }

  processData() {
    this.colorWidth = (histoWidth - margin.left - margin.right) / this.props.numBlocks;

    const sumMax = this.props.sumMax || d3.max(this.props.groups, d => d.sum);
    let heightMax = histoHeight - margin.top;
    if (this.props.legend) {
      heightMax = heightMax - margin.top - margin.bottom;
    }
    this.heightScale.domain([0, sumMax]).range([0, heightMax]);
  }

  renderData() {
    _.each(this.props.groups, group => {
      const x = group.key * this.colorWidth + margin.left;
      let y = histoHeight - (this.props.legend ? margin.bottom : 0);
      _.each(group.values, value => {
        const colorHeight = this.heightScale(value.size);
        y -= colorHeight;
        let color = !value.keep ? '#efefef' :
          chroma(value.color[0], value.color[1], value.color[2], 'hsl');

        this.ctx.beginPath();
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = color;
        this.ctx.rect(x, y, this.colorWidth, colorHeight);
        this.ctx.fill();
        this.ctx.stroke();
      });

      this.ctx.clearRect(x - 1, 0, 1, histoHeight);
      this.ctx.clearRect(x + this.colorWidth - 0.25, 0, histoWidth, histoHeight);
    });
  }

  renderLegend() {
    // color legend under chart
    const y = histoHeight - 1 * margin.bottom + 2;
    const colorHeight = 0.75 * this.colorWidth;
    _.each(this.props.groups, group => {
      const color = chroma(group.hue, 0.75, group.lightness || 0.5, 'hsl');
      const x = group.key * this.colorWidth + margin.left;

      this.ctx.beginPath();
      this.ctx.fillStyle = color;
      this.ctx.rect(x, y, this.colorWidth, colorHeight);
      this.ctx.fill();

      this.ctx.clearRect(x - 1, y, 1, colorHeight);
      this.ctx.clearRect(x + this.colorWidth - 0.25, y, histoWidth, colorHeight);
    });
  }

  renderLine() {
    // draw line under chart
    this.ctx.beginPath();
    this.ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    this.ctx.fillRect(margin.left, histoHeight - (this.props.legend ? margin.bottom : 1),
      histoWidth - margin.left - margin.right, 1);
  }

  render() {
    return (
      <canvas ref='container' width={histoWidth} height={histoHeight} />
    );
  }
}

export default Histogram;
