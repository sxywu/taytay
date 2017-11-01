import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import chroma from 'chroma-js';

import Histogram from './visualizations/Histogram';
import HeatMap from './visualizations/HeatMap';

const hue = 0;
const saturation = 1;
const lightness = 2;

const videosMetadata = require('./data/metadata.json');
const videosData = _.map(require('./data/youtube.json'), video => {
  const metadata = _.find(videosMetadata, meta => meta['Youtube Id'] === video.id);
  return Object.assign(video, require(`./data/${video.id}.json`), {
    title: metadata.Title,
    bpm: metadata.BPM,
    year: metadata.Year,
    director: metadata.Director,
    album: metadata.Album,
  });
});

function groupByHue(colors) {
  const groupByHue = d3.nest()
    .key(d => _.floor(d.color[hue] / 5))
    .sortKeys((a, b) => {
      a = parseInt(a);
      b = parseInt(b);
      return d3.ascending(a, b);
    }).sortValues((a, b) => {
      a = a.color[lightness];
      b = b.color[lightness];
      return d3.descending(a, b);
    })
    .entries(colors);
  _.each(groupByHue, group => {
    Object.assign(group, {
      key: parseInt(group.key),
      hue: _.floor(group.values[0].color[hue] / 5) * 5,
      sum: _.sumBy(group.values, value => value.size),
    });
  });

  return groupByHue;
}

function groupByLightness(colors) {
  const groupByLightness = d3.nest()
    .key(d => _.round(_.floor(d.color[lightness] / 0.025) * 0.025, 3))
    .sortKeys((a, b) => {
      a = parseFloat(a);
      b = parseFloat(b);
      return d3.ascending(a, b);
    }).entries(colors);
  _.each(groupByLightness, group => {
    Object.assign(group, {
      lightness: parseFloat(group.key),
      sum: _.sumBy(group.values, value => value.size),
    });
  });

  return groupByLightness;
}

function groupByHueLightness(colors) {
  const groupByHueLightness = d3.nest()
    .key(d => _.floor(d.color[hue] / 45) * 10 + _.floor(d.color[lightness], 1) * 10)
    .sortKeys((a, b) => {
      a = parseFloat(a);
      b = parseFloat(b);
      return d3.ascending(a, b);
    }).sortValues((a, b) => {
      a = a.color[saturation];
      b = b.color[saturation];
      return d3.descending(a, b);
    }).entries(colors);
  _.each(groupByHueLightness, group => {
    Object.assign(group, {
      key: parseInt(group.key),
      hue: _.floor(group.values[0].color[hue] / 45) * 45,
      lightness: _.floor(group.values[0].color[lightness], 1),
      sum: _.sumBy(group.values, value => value.size),
    });
  });
  return groupByHueLightness;
}

class App extends Component {
  componentWillMount() {
    this.calculateData();
  }

  calculateData() {
    _.each(videosData, video => {
      _.each(video.colors, color => {
        Object.assign(color, {color: chroma(color.color).hsl()});
      });
      _.each(video.frames, frame => {
        _.each(frame.colors, color => {
          Object.assign(color, {color: chroma(color.color).hsl()});
        });
        Object.assign(frame, {
          groupByHue: groupByHue(frame.colors),
          // groupByHueLightness: groupByHueLightness(frame.colors),
        });
      });

      Object.assign(video, {
        groupByHue: groupByHue(video.colors),
        // groupByLightness: groupByLightness(video.colors),
        // groupByHueLightness: groupByHueLightness(video.colors),
      });
    });
  }

  render() {
    const histoWidth = 480;
    const histoHeight = 240;
    const histogramStyle = {
      display: 'inline-block',
      width: histoWidth,
      margin: 'auto',
      textAlign: 'center',
      padding: 20,
      verticalAlign: 'top',
    };

    const videos = _.map(videosData, video => {
      const heatMapHeight = video.frames.length * 4;
      return (
        <div style={histogramStyle}>
          <p><strong>{video.title}</strong></p>
          <Histogram groups={video.groupByHue} numBlocks={72}width={histoWidth} height={histoHeight} />
          <HeatMap data={_.map(video.frames, 'groupByHue')} numBlocks={72}
            width={histoWidth} height={heatMapHeight} />
        </div>
      );
    });
    const heatmaps = _.chain(videosData)
      .groupBy(video => video.album)
      .sortBy(videos => videos[0].year)
      .map((videos) => {
        const nameHeight = (14 * videos.length - 10) / videos.length;
        const videoNames = _.map(videos, d => <div style={{height: nameHeight}}>{d.title}</div>);
        const nameStyle = {
          width: 240,
          textAlign: 'right',
          padding: 5,
          fontSize: 10,
          display: 'inline-block',
          verticalAlign: 'top',
        }
        return (
          <div style={{position: 'relative'}}>
            <div style={{marginLeft: 255}}>{videos[0].album}</div>
            <div style={nameStyle}>
              {videoNames}
            </div>
            <HeatMap data={_.map(videos, 'groupByHue')} numBlocks={72}
              border={true} width={6 * 80} height={14 * videos.length} />
          </div>
        )
      }).value();

    return (
      <div className="App">
        {heatmaps}
        {videos}
      </div>
    );
  }
}

export default App;
