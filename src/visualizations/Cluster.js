import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import chroma from 'chroma-js';

const width = 600;
const height = 180;
const margins = {left: 20, right: 20, top: 20, bottom: 20};

const hueScale = d3.scaleLinear().domain([0, 360]).range([margins.left, width - margins.right]);
const saturationScale = d3.scaleLinear().range([height - margins.bottom, margins.top]);
const sizeScale = d3.scaleLinear().range([3, 12]);

class Cluster extends Component {

  constructor(props) {
    super(props);

    // create d3 force simulation
    this.simulation = d3.forceSimulation();
  }

  componentDidMount() {
    this.container = d3.select(this.refs.container);
    const sizeExtent = d3.extent(this.props.colors, color => color.size);
    sizeScale.domain(sizeExtent);

    const nodes = _.map(this.props.colors, node => {
      let {size, color} = node;
      color = `rgb(${color})`;
      const [hue, saturation, lightness] = chroma(color).hsl();
      const x = hueScale(hue);
      const y = saturationScale(saturation);
      size = sizeScale(size);

      return {color, x, y, size};
    });

    this.container.selectAll('circle')
      .data(nodes).enter().append('circle')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', d => d.size)
      .attr('fill', d => d.color);
  }

  render() {
    return (
      <svg ref='container' width={width} height={height} />
    );
  }
}

export default Cluster;
