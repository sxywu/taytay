import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import chroma from 'chroma-js'

class BarChart extends Component {
  componentDidMount() {
    this.canvas = d3.select(this.refs.canvas);
    this.ctx = this.refs.canvas.getContext('2d');

    this.brush = d3.brushX()
      .extent([[0, 0], [this.props.width, this.props.height]])
      .on('end', this.onBrushEnd);
    this.svg = d3.select(this.refs.svg).call(this.brush);

    this.heightScale = d3.scaleLinear().range([0, this.props.height]);
    this.xScale = d3.scaleLinear().range([0, this.props.width]);
    if (this.props.type === 'hue') {
      this.xScale.domain([0, 360]);
    }

    this.calculateDimensions();
    this.renderBars();
  }

  componentDidUpdate() {
    this.ctx.clearRect(0, 0, this.props.width, this.props.height);
    this.calculateDimensions();
    this.renderBars();
  }

  calculateDimensions() {
    const max = d3.max(this.props.data, d => d.sum);
    this.heightScale.domain([0, max]);

    this.colorWidth = (this.props.type === 'hue' ? this.xScale(5) : this.xScale(0.025)) - this.xScale(0);
  }

  renderBars() {
    _.each(this.props.data, group => {
      const x = group.key * this.colorWidth;
      const barHeight = this.heightScale(group.sum);

      // hue, sat, lightness
      if (this.props.type === 'hue') {
        this.ctx.fillStyle = chroma(group.hue, 0.75, 0.5, 'hsl').css();
      } else if (this.props.type === 'sat') {
        this.ctx.fillStyle = chroma(180, group.saturation, 0.5, 'hsl').css();
      } else if (this.props.type === 'light') {
        this.ctx.fillStyle = chroma(180, 0.75, group.lightness, 'hsl').css();
      }
      this.ctx.fillRect(x, this.props.height - barHeight, this.colorWidth, barHeight);
    });
  }

  onBrushEnd = () => {
    const [minX, maxX] = d3.event.selection;
    this.props.filter(this.props.type, [this.xScale.invert(minX), this.xScale.invert(maxX)]);
  }

  render() {
    return (
      <div style={{position: 'relative'}}>
        <canvas ref='canvas' width={this.props.width} height={this.props.height} />
        <svg ref='svg' style={{position: 'absolute', top: 0, left: 0}}
          width={this.props.width} height={this.props.height} />
      </div>
    );
  }
}

export default BarChart;
