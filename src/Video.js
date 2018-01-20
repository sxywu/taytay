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
    this.state = {hoveredFrame: null};
  }

  hoverFrame = (frame) => {
    // if (frame === this.state.hoveredFrame) return;
    // if (!this.props.data.frames[frame]) {
    //   frame = null;
    // }
    // this.setState({hoveredFrame: frame});
  }

  render() {
    const style = {
      display: 'inline-block',
      width: this.props.width * 4,
      margin: 'auto',
      textAlign: 'center',
      padding: 20,
      verticalAlign: 'top',
    };

    const histoProps = {
      groups: this.props.data.groupByHue,
      sumMax: d3.max(this.props.data.groupByHue, d => d.sum),
      numBlocks: 72,
      // legend: true,
      width: this.props.width,
      height: this.props.height,
    }
    if (!_.isNull(this.state.hoveredFrame)) {
      const sumMax = _.chain(this.props.data.frames).map('groupByHue')
        .flatten().maxBy('sum').value();
      Object.assign(histoProps, {
        groups: this.props.data.frames[this.state.hoveredFrame].groupByHue,
        sumMax: sumMax ? sumMax.sum : 0,
      });
    }

    const heatMapProps = {
      data: _.map(this.props.data.frames, 'groupByHue'),
      width: this.props.width,
      height: this.props.data.frames.length * 4,
      rowHeight: 7,
      numBlocks: 72,
      hoverRow: this.hoverFrame, // function
      hoveredRow: this.state.hoveredFrame, // index of row hovered
    }

    const screenshotProps = {
      filters: this.props.filters,
      videoId: this.props.data.id,
      frames: this.props.data.frames,
    }

    return (
      <div style={style}>
        <div style={{display: 'inline-block', width: this.props.width, verticalAlign: 'top', paddingRight: 40}}>
          <p><strong>{this.props.data.title} ({this.props.data.year})</strong></p>
          <Histogram {...histoProps} />
          <HeatMap {...heatMapProps} />
        </div>
        <Screenshots {...screenshotProps} />
      </div>
    );
  }
}

export default Video;
