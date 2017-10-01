import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

import Cluster from './Cluster';
import videoData from './data/VuNIsY6JdUw.json';

class App extends Component {
  render() {
    console.log(videoData)

    const videoId = 'VuNIsY6JdUw';
    const images = _.map(videoData, image => {
      return (
        <div>
          <img src={`${process.env.PUBLIC_URL}/images/${videoId}/${image.screenshot}`} />
          <Cluster {...image} />
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
