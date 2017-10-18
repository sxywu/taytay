import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import chroma from 'chroma-js';

import Cluster from './Cluster';
import Histogram from './visualizations/Histogram';

const hue = 0;
const saturation = 1;
const lightness = 2;

const videosData = _.map(require('./data/youtube.json'), video => {
  return Object.assign(video, require(`./data/${video.id}.json`));
});

class App extends Component {
  componentWillMount() {
    this.calculateData();
  }

  calculateData() {
    this.colorsForVideos = _.map(videosData, video => {
      _.each(video.colors, color => {
        Object.assign(color, {color: chroma(color.color).hsl()});
      });
      const groupByHue = d3.nest()
        .key(d => _.floor(d.color[hue] * 2, -1) / 2)
        .sortKeys((a, b) => {
          a = parseInt(a);
          b = parseInt(b);
          return d3.ascending(a, b);
        }).sortValues((a, b) => {
          a = a.color[lightness];
          b = b.color[lightness];
          return d3.descending(a, b);
        })
        .entries(video.colors);

      _.each(groupByHue, group => {
        Object.assign(group, {
          hue: parseInt(group.key),
          sum: _.sumBy(group.values, value => value.size),
        });
      });

      return Object.assign(video, {groupByHue});
    });
  }

  render() {
    const histoWidth = 600;
    const histogramStyle = {
      display: 'inline-block',
      width: histoWidth,
      margin: 'auto',
      textAlign: 'center',
      padding: 20,
    };
    const images = _.map(videosData, video => {
      return (
        <div style={histogramStyle}>
          <p><strong>{video.snippet.title}</strong></p>
          <Histogram groups={video.groupByHue} width={histoWidth} height={240} />
        </div>
      );
    });

    return (
      <div className="App">
        {images}
      </div>
    );
  }
}

export default App;
