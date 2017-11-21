import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import chroma from 'chroma-js';

const margin = {left: 20, top: 5, right: 20, bottom: 5};
const minRadius = 2;
const maxRadius = 8;

class Beeswarm extends Component {
  componentDidMount() {
    this.canvas = d3.select(this.refs.canvas);
    this.ctx = this.refs.canvas.getContext('2d');

    this.xScale = d3.scaleLinear().range([margin.left, this.props.width - margin.right]);
    this.yScale = d3.scaleLinear().domain([0, 360])
      .range([this.props.height - 180, this.props.height + 180])

    const sizeExtent = d3.extent(this.props.data, d => d.size);
    this.radiusScale = d3.scaleSqrt().domain(sizeExtent).range([minRadius, maxRadius]);

    this.calculateData();

    this.simulation = d3.forceSimulation(this.data)
      .force('x', d3.forceX().x(d => d.focusX))
      .force('y', d3.forceY(this.props.height / 2))
      .force('collide', d3.forceCollide().radius(d => d.radius))
      .on('tick', this.onTick);
  }

  calculateData() {
    this.data = _.chain(this.props.data)
      .sortBy(d => -d.size).take(Math.floor(this.props.data.length / 4))
      .map(d => {
        return Object.assign(d, {
          focusX: this.xScale(d.color[2]),
          radius: this.radiusScale(d.size),
          x: this.xScale(d.color[2]),
          y: this.yScale(d.color[0]),
        });
      }).value();
    console.log(this.data)
  }

  onTick = () => {
    this.ctx.clearRect(0, 0, this.props.width, this.props.height);

    this.ctx.strokeStyle = '#111';
    _.each(this.data, d => {
      if (d.x - d.radius < 0) {
        d.x = d.radius;
      } else if (d.x + d.radius > this.props.width) {
        d.x = this.props.width - d.radius;
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
  }

  render() {
    return (
      <canvas ref='canvas' width={this.props.width} height={this.props.height} />
    );
  }
}

export default Beeswarm;
