import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import chroma from 'chroma-js';

const margin = {left: 5, top: 5, right: 5, bottom: 5};

class HeatMap extends Component {
  componentDidMount() {
    this.canvas = d3.select(this.refs.canvas)
      .on('mousemove', this.hoverRow)
      .on('mouseleave', () => this.props.hoverRow(null));
    this.ctx = this.refs.canvas.getContext('2d');

    this.svg = d3.select(this.refs.svg);
    this.hoveredRect = this.svg.append('rect')
      .attr('fill', 'none')
      .attr('stroke', '#111')
      .attr('stroke-width', 2)
      .style('display', 'none');

    this.colorWidth = (this.props.width - margin.left - margin.right) / this.props.numBlocks;
    this.opacityScale = d3.scaleLinear().range([10, 100]);

    this.colorHeight = (this.props.height - margin.top - margin.bottom) / this.props.data.length;
    this.renderData();
    this.renderBorders();
    this.renderHover();
  }

  componentDidUpdate() {
    this.colorHeight = (this.props.height - margin.top - margin.bottom) / this.props.data.length;
    this.renderHover();
  }

  renderData() {
    _.each(this.props.data, (row, i) => {
      const y = i * this.colorHeight + margin.top;
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
        this.ctx.rect(x, y, this.colorWidth, this.colorHeight);
        this.ctx.fill();
      });
    });
  }

  renderBorders() {
    this.ctx.fillStyle = '#fcfcfc';

    _.times(this.props.data.length + 1, i => {
      const y = i * this.colorHeight + margin.top;
      this.ctx.clearRect(margin.left, y, this.props.width - margin.left - margin.right, 1);
      this.ctx.fillRect(margin.left, y, this.props.width - margin.left - margin.right, 1);
    });
  }

  renderHover() {
    if (_.isNull(this.props.hoveredRow)) {
      this.hoveredRect.style('display', 'none');
      return;
    }

    this.hoveredRect.style('display', 'block')
      .attr('x', margin.left)
      .attr('y', this.colorHeight * this.props.hoveredRow + margin.top)
      .attr('width', this.props.width - margin.left - margin.right)
      .attr('height', this.colorHeight);
  }

  hoverRow = () => {
    const [x, y] = d3.mouse(this.refs.canvas);
    let frame = _.floor((y - margin.top) / this.colorHeight);

    this.props.hoverRow(frame);
  }

  render() {
    return (
      <div style={{position: 'relative'}}>
        <canvas ref='canvas' width={this.props.width} height={this.props.height} />
        <svg ref='svg' style={{position: 'absolute', top: 0, left: 0, pointerEvents: 'none'}}
          width={this.props.width} height={this.props.height} />
      </div>
    );
  }
}

export default HeatMap;
