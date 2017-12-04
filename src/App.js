import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

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

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      filterRanges: {
        hueRange: [320, 360],
        satRange: [0, 1],
        lightRange: [0, 1],
      }
    };
  }

  componentWillMount() {
    FilterData.calculateData(videosData);
  }

  render() {
    const histoWidth = 360;
    const histoHeight = 180;

    FilterData.filterByHSL(videosData, this.state.filterRanges);

    const videos = _.map(videosData, video =>
      <Video data={video} width={histoWidth} height={histoHeight} />);

    const summaryWidth = 480;
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
    // const summary = _.chain(videosData)
    //   .groupBy(video => video.album)
    //   .sortBy(videos => videos[0].year)
    //   .map((videos) => {
    //     const histograms = _.map(videos, video => {
    //       return (
    //         <div style={{position: 'relative'}}>
    //           <div style={nameStyle}>{video.title}</div>
    //           <Beeswarm data={video.colors} width={summaryWidth} height={80} />
    //         </div>
    //       );
    //     });
    //     return (
    //       <div style={summaryStyle}>
    //         <h4 style={{textAlign: 'center'}}>{videos[0].album}</h4>
    //         {histograms}
    //       </div>
    //     )
    //   }).value();

    console.log(videosData);
    return (
      <div className="App">
        {videos}
      </div>
    );
  }
}

export default App;
