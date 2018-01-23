import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import chroma from 'chroma-js';

import Histogram from './visualizations/Histogram';
import HeatMap from './visualizations/HeatMap';
import Screenshots from './visualizations/Screenshots';
import FilterData from './FilterData';
const ratio = 180 / 320;

class Video extends Component {

  constructor(props) {
    super(props);
    this.state = {hoveredFrame: 0, updateFilters: false, prevHovered: 0};
  }

  componentWillReceiveProps() {
    this.setState({hoveredFrame: 0, updateFilters: true});
  }

  hoverFrame = (frame) => {
    if (frame === this.state.hoveredFrame) return;
    if (!this.props.data.frames[frame]) {
      frame = 0;
    }
    this.setState({hoveredFrame: frame, prevHovered: this.state.hoveredFrame, updateFilters: false});
  }

  render() {
    const style = {
      display: 'inline-block',
      margin: 'auto',
      padding: '0 0 20px 20px',
      verticalAlign: 'top',
    };

    const groups = this.props.data.frames[this.state.hoveredFrame].groupByHue;
    const histoProps = {
      groups,
      sumMax: d3.max(groups, d => d.sum),
      numBlocks: 72,
      // legend: true,
      width: this.props.width,
      height: this.props.height,
    };

    const screenshotProps = {
      filters: this.props.filters,
      videoId: this.props.data.id,
      frames: this.props.data.frames,
      hoveredFrame: this.state.hoveredFrame,
      prevHovered: this.state.prevHovered,
      hoverFrame: this.hoverFrame,
      updateFilters: this.state.updateFilters,
    }

    return (
      <div style={style}>
        <div><strong>{this.props.data.title} ({this.props.data.year})</strong></div>
        <div>
          <Histogram {...histoProps} />
          <Screenshots {...screenshotProps} />
        </div>
      </div>
    );
  }
}

export default Video;
