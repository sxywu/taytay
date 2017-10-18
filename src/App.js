import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import chroma from 'chroma-js';

import Cluster from './Cluster';
import Histogram from './visualizations/Histogram';

import videosData from './data/youtube.json';
import allColors from './data/allColors.json';

class App extends Component {
  render() {
    _.each(allColors, color => {
      return Object.assign(color, {
        color: chroma(color.color).hsl(),
      });
    });

    const histoWidth = 600;
    const histogramStyle = {
      display: 'inline-block',
      width: histoWidth,
      margin: 'auto',
      textAlign: 'center',
      padding: 20,
    };
    const images = _.map(videosData, video => {
      const videoData = require(`./data/${video.id}.json`);
      const videoImage = videoData.frames[Math.floor(videoData.frames.length / 2)]; // take the middle screenshot
      const colors = _.chain(videoData.colors)
        .map(color => {
          return Object.assign(color, {
            color: chroma(color.color).hsl(),
          });
        })
        // .filter(color => color.color[2] > 0.1)
        .value();
      return (
        <div style={histogramStyle}>
          <p><strong>{video.snippet.title}</strong></p>
          <Histogram colors={colors} width={histoWidth} height={240} />
        </div>
      );
    });

    return (
      <div className="App">
        <div style={histogramStyle}>
          <Histogram colors={allColors} width={1200} height={240}/>
        </div>
        <br />
        {images}
      </div>
    );
  }
}

export default App;
