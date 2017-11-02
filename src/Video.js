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
    if (frame === this.hoverFrame) return;
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
      groups: !_.isNull(this.state.hoveredFrame) ?
        this.props.data.frames[this.state.hoveredFrame].groupByHue : this.props.data.groupByHue,
      numBlocks: 72,
      legend: true,
      width: this.props.width,
      height: this.props.height,
    }
    const heatMapProps = {
      data: _.map(this.props.data.frames, 'groupByHue'),
      width: this.props.width,
      height: this.props.data.frames.length * 6,
      rowHeight: 7,
      numBlocks: 72,
      hoverRow: this.hoverFrame,
    }
    let imageSrc;
    if (!_.isNull(this.state.hoveredFrame)) {
      imageSrc = this.props.data.frames[this.state.hoveredFrame];
      imageSrc = `/images/${this.props.data.id}/${imageSrc.screenshot}`;
    }

    return (
      <div style={style}>
        <p><strong>{this.props.data.title}</strong></p>
        <Histogram {...histoProps} />
        <HeatMap {...heatMapProps} />
        <img src={imageSrc} width={this.props.width} />
      </div>
    );
  }
}

export default Video;
