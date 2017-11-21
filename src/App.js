import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import chroma from 'chroma-js';

import Histogram from './visualizations/Histogram';
import Video from './Video';
import FilterData from './FilterData';

const hue = 0;
const saturation = 1;
const lightness = 2;

const videosMetadata = require('./data/metadata.json');
const videosData = _.chain(require('./data/youtube.json'))
  .map(video => {
    const metadata = _.find(videosMetadata, meta => meta['Youtube Id'] === video.id);
    return Object.assign(video, require(`./data/${video.id}.json`), {
      title: metadata.Title,
      bpm: metadata.BPM,
      year: metadata.Year,
      director: metadata.Director,
      album: metadata.Album,
      concert: metadata.Concert,
    });
  }).filter(video => video.album && !video.concert).value();

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
    }).entries(colors);
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
    .key(d => _.floor(d.color[lightness] / 0.025))
    .sortKeys((a, b) => {
      a = parseFloat(a);
      b = parseFloat(b);
      return d3.ascending(a, b);
    }).sortValues((a, b) => d3.ascending(a.color[hue], b.color[hue]))
    .entries(colors);
  _.each(groupByLightness, group => {
    Object.assign(group, {
      key: parseInt(group.key),
      lightness: _.floor(group.values[0].color[lightness] / 0.025) * 0.025,
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
  constructor(props) {
    super(props);

    this.state = {
      filteredHue: [0, 360]
    };
  }

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

    FilterData.filterByHue(videosData, [300, 320]);
    const videos = _.map(videosData, video =>
      <Video data={video} width={histoWidth} height={histoHeight} />);

    const summaryWidth = 360;
    const summaryStyle = {
      position: 'relative',
      width: summaryWidth,
      display: 'inline-block',
      verticalAlign: 'top',
      padding: 20,
    }
    const nameStyle = {
      fontSize: 10,
      position: 'absolute',
      width: summaryWidth,
      textAlign: 'center',
    };
    const summary = _.chain(videosData)
      .groupBy(video => video.album)
      .sortBy(videos => videos[0].year)
      .map((videos) => {
        const histograms = _.map(videos, video => {
          return (
            <div style={{position: 'relative'}}>
              <div style={nameStyle}>{video.title}</div>
              <Histogram groups={video.groupByHue} numBlocks={72}
                width={summaryWidth} height={50} />
            </div>
          );
        });
        return (
          <div style={summaryStyle}>
            <h4 style={{textAlign: 'center'}}>{videos[0].album}</h4>
            {histograms}
          </div>
        )
      }).value();

    return (
      <div className="App">
        {summary}
        {videos}
      </div>
    );
  }
}

export default App;
