import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

const margin = {left: 5, top: 5, right: 5, bottom: 20};

class LineChart extends Component {
  componentWillMount() {
    const xExtent = d3.extent(this.props.lines[0].data, line => parseFloat(line.key));
    this.xScale = d3.scaleLinear().domain(xExtent)
      .range([margin.left, this.props.width - margin.right]);
    let yExtent = _.chain(this.props.lines).map('data').flatten().map('sum').value();
    yExtent = d3.extent(yExtent, sum => sum);
    this.yScale = d3.scaleLinear().domain(yExtent)
      .range([this.props.height - margin.bottom, margin.top]);
    const opacityExtent = d3.extent(this.props.lines, video => video.date);
    this.opacityScale = d3.scaleTime().domain(opacityExtent).range([0.1, 1]);

    this.lineGenerator = d3.line()
      .x(d => this.xScale(parseFloat(d.key)))
      .y(d => this.yScale(d.sum))
      // .curve(d3.curveStep);
  }

  componentDidMount() {
    this.container = d3.select(this.refs.container);

    const lines = this.container.selectAll('path')
      .data(this.props.lines).enter().append('path')
      .attr('fill', 'none')
      .attr('stroke', '#000')
      .attr('stroke-width', 2)
      .attr('opacity', d => this.opacityScale(d.date))
      .attr('d', d => this.lineGenerator(d.data));
  }

  render() {
    return (
      <svg ref='container' width={this.props.width} height={this.props.height}/>
    );
  }
}

export default LineChart;
