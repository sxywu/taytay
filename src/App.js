import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

import Cluster from './Cluster';
import videoData from './data/youtube.json';

class App extends Component {
  render() {
    var images = _.chain(videoData)
      .takeRight(10)
      .map(video => {
        return (<Cluster key={video.id} video={video} />);
      }).value();
    return (
      <div className="App">
        {images}
      </div>
    );
  }
}

export default App;
