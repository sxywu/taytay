import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import chroma from 'chroma-js';

import Cluster from './Cluster';
import videosData from './data/youtube.json';

class App extends Component {
  render() {
    const images = _.map(videosData, video => {
      const videoData = require(`./data/${video.id}.json`);
      const videoImage = videoData[Math.floor(videoData.length / 2)]; // take the middle screenshot
      const colors = _.chain(videoData).map('colors').flatten()
        .filter(color => chroma(color.color).hsl()[2] > 0.1)
        .value();

      return (
        <div>
          <img src={`${process.env.PUBLIC_URL}/images/${video.id}/${videoImage.screenshot}`} />
          <Cluster colors={colors} />
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
