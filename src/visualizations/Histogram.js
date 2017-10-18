import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import chroma from 'chroma-js';

const hue = 0;
const saturation = 1;
const lightness = 2;

const width = 600;
const height = 180;

class Histogram extends Component {

  componentWillMount() {

    this.xScale = d3.scaleLinear().domain([0, 360]).range([0, width]);
    this.heightScale = d3.scaleLinear().range([0.01, height]);

    this.groups = d3.nest()
      .key(d => _.floor(d.color[hue], -1))
      .sortKeys((a, b) => {
        a = parseInt(a);
        b = parseInt(b);
        return d3.ascending(a, b);
      }).sortValues((a, b) => {
        a = a.color[lightness];
        b = b.color[lightness];
        return d3.ascending(a, b);
      })
      .entries(this.props.colors);

    _.each(this.groups, group => {
      Object.assign(group, {
        hue: parseInt(group.key),
        sum: _.sumBy(group.values, value => value.size),
      });
    });

    const sumMax = d3.max(this.groups, d => d.sum);
    this.heightScale.domain([1, sumMax]);
  }

  componentDidMount() {
    this.canvas = d3.select(this.refs.container);
    this.ctx = this.refs.container.getContext('2d');

    const colorWidth = this.xScale(10);
    _.each(this.groups, group => {
      const x = this.xScale(group.hue);
      let y = height - 1;
      _.each(group.values, value => {
        const colorHeight = this.heightScale(value.size);
        y -= colorHeight;

        this.ctx.beginPath();
        this.ctx.fillStyle = chroma(value.color[0], value.color[1], value.color[2], 'hsl');
        this.ctx.fillRect(x, y, colorWidth, colorHeight);
      });
    });
  }

  render() {
    return (
      <canvas ref='container' width={width} height={height} />
    );
  }
}

export default Histogram;
