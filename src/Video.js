import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import chroma from 'chroma-js';

import Histogram from './visualizations/Histogram';
import HeatMap from './visualizations/HeatMap';
import Screenshot from './visualizations/Screenshot';
import FilterData from './FilterData';
const ratio = 180 / 320;

class Video extends Component {

  constructor(props) {
    super(props);
    this.state = {hoveredFrame: null, frameColors: null};
  }

  componentWillMount() {
    d3.json(`./hsl/${this.props.data.id}.json`, (err, frameColors) => {
      this.setState({frameColors});
    });
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
      width: this.props.width * 3,
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

    let screenshots;
    if (this.state.frameColors) {
      screenshots = _.chain(this.props.data.frames)
        // .filter(frame => frame.keepCount)
        .map((frame, i) => {
          const props = {
            width: 90,
            height: 51,
            filters: this.props.filters,
            videoId: this.props.data.id,
            colors: this.state.frameColors[i],
          }

          return (<Screenshot key={`${this.props.data.id}-${i}`} {...props} />);
        }).value();
    }

    return (
      <div style={style}>
        <div style={{display: 'inline-block', width: this.props.width, verticalAlign: 'top', paddingRight: 40}}>
          <p><strong>{this.props.data.title} ({this.props.data.year})</strong></p>
          <Histogram {...histoProps} />
          <HeatMap {...heatMapProps} />
        </div>
        <div style={{display: 'inline-block', width: 1.5 * this.props.width, textAlign: 'left'}}>
          {screenshots}
        </div>
      </div>
    );
  }
}

export default Video;
