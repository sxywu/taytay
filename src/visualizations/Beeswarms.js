import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import chroma from 'chroma-js';

const margin = {left: 5, top: 20, right: 5, bottom: 20};
let minRadius = 2.5;
let maxRadius = 12;

class Beeswarms extends Component {
  componentDidMount() {
    this.canvas = d3.select(this.refs.canvas);
    this.ctx = this.refs.canvas.getContext('2d');

    this.xScale = d3.scaleLinear().domain([0, 360]).range([0, this.props.songWidth]);
    this.radiusScale = d3.scaleSqrt().range([minRadius, maxRadius]);

    this.calculateData();

    this.simulation = d3.forceSimulation(this.data)
      .force('x', d3.forceX().x(d => d.focusX))
      .force('y', d3.forceY().y(d => d.focusY))
      .force('collide', d3.forceCollide().radius(d => 0.75 * d.radius))
      .on('tick', this.onTick);
  }

  calculateData() {
    const sizeExtent = d3.extent(this.props.data, d => d.size);
    this.radiusScale.domain(sizeExtent);

    this.data = _.chain(this.props.data)
      .map(d => {
        const [x1, x2] = d.bounds;
        return Object.assign(d, {
          focusX: (x1 + x2) / 2,
          focusY: this.props.yScale(d.color[1]),
          radius: this.radiusScale(d.size),
          x: x1 + this.xScale(d.color[0]),
          y: this.props.yScale(d.color[1]),
        });
      }).value();
  }

  onTick = () => {
    this.ctx.clearRect(0, 0, this.props.width, this.props.height);

    _.each(this.data, d => {
      const [x1, x2] = d.bounds;
      if (d.x - d.radius < x1) {
        d.x = x1 + d.radius;
      } else if (d.x + d.radius > x2) {
        d.x = x2 - d.radius;
      }
      if (d.y - d.radius < 0) {
        d.y = d.radius;
      } else if (d.y + d.radius > this.props.height) {
        d.y = this.props.height - d.radius;
      }

      this.ctx.fillStyle = `hsl(${d.color[0]}, ${d.color[1] * 100}%, ${d.color[2] * 100}%)`;

      this.ctx.beginPath();
      this.ctx.arc(d.x, d.y, d.radius, 0, 2 * Math.PI, 1);
      this.ctx.fill();
    });

    this.ctx.fillStyle = '#fff';
    this.ctx.fillRect(0, this.p5, this.props.width, 3);

    // this.ctx.fillStyle = 'rgba(255,255,255,0.85)';
    // this.ctx.fillRect(0, this.p25, this.props.width, this.props.height - this.p25);
    // this.ctx.fillRect(0, 0, this.props.width, this.p75);
  }

  render() {
    return (
      <canvas ref='canvas' width={this.props.width} height={this.props.height} />
    );
  }
}

export default Beeswarms;
