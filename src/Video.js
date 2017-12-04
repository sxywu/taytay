import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

import Histogram from './visualizations/Histogram';
import HeatMap from './visualizations/HeatMap';

class Video extends Component {

  constructor(props) {
    super(props);
    this.state = {hoveredFrame: null};
  }

  hoverFrame = (frame) => {
    if (frame === this.state.hoveredFrame) return;
    if (!this.props.data.frames[frame]) {
      frame = null;
    }
    this.setState({hoveredFrame: frame});
  }

  render() {
    const style = {
      display: 'inline-block',
      width: this.props.width,
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
    let imageIndex = _.isNull(this.state.hoveredFrame) ? 0 : this.state.hoveredFrame;
    let imageSrc = this.props.data.frames[imageIndex];
    imageSrc = `/images/${this.props.data.id}/${imageSrc.screenshot}`;

    return (
      <div style={style}>
        <p><strong>{this.props.data.title}</strong></p>
        <img src={imageSrc} width={this.props.width} /><br />
        <Histogram {...histoProps} />
        <HeatMap {...heatMapProps} />
      </div>
    );
  }
}

export default Video;
