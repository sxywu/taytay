import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import chroma from 'chroma-js';

import Histogram from './visualizations/Histogram';
import LineChart from './visualizations/LineChart';

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

      const groupByLightness = d3.nest()
        .key(d => _.round(Math.floor(d.color[lightness] / 0.025) * 0.025, 3))
        .sortKeys((a, b) => {
          a = parseFloat(a);
          b = parseFloat(b);
          return d3.ascending(a, b);
        }).entries(video.colors);
      _.each(groupByLightness, group => {
        Object.assign(group, {
          lightness: parseFloat(group.key),
          sum: _.sumBy(group.values, value => value.size),
        });
      });

      return Object.assign(video, {groupByHue, groupByLightness});
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

    const lineChartData = _.map(videosData, video => {
      // const data = _.times(1 / 0.025, i => {
      //   const key = `${_.round(i * 0.025, 3)}`;
      //   const hue = _.find(video.groupByLightness, d => d.key === key);
      //   return hue ? {key: hue.key, sum: hue.sum} : {key, sum: 0};
      // });
      const data = _.times(360 / 5, i => {
        const key = `${i * 5}`;
        const hue = _.find(video.groupByHue, d => d.key === key);
        return hue ? {key: hue.key, sum: hue.sum} : {key, sum: 0};
      });
      return {data, id: video.id, date: new Date(video.snippet.publishedAt)};
    });
    console.log(lineChartData);

    const videos = _.map(videosData, video => {
      return (
        <div style={histogramStyle}>
          <p><strong>{video.snippet.title}</strong></p>
          <Histogram groups={video.groupByHue} width={histoWidth} height={240} />
        </div>
      );
    });

    return (
      <div className="App">
        <LineChart lines={lineChartData} width={2 * histoWidth} height={480} />
        {videos}
      </div>
    );
  }
}

export default App;
