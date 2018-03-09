import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

import SaturationGraph from './visualizations/SaturationGraph';
import Video from './Video';
import BarChart from './visualizations/BarChart';
import FilterData from './FilterData';

const hue = 0;
const saturation = 1;
const lightness = 2;

const videosMetadata = require('./data/metadata.json');
let videosData = _.chain(require('./data/youtube.json'))
  .map(video => {
    const metadata = _.find(videosMetadata, meta => meta['Youtube Id'] === video.id);
    const order = videosMetadata.indexOf(metadata);
    return Object.assign(video, require(`./data/${video.id}.json`), {
      title: metadata.Title,
      bpm: metadata.BPM,
      year: metadata.Year,
      director: metadata.Director,
      album: metadata.Album,
      concert: metadata.Concert,
      order,
    });
  }).filter(video => video.album && !video.concert)
  .sortBy(video => video.order)
  .value();

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hueRange: [0, 360],
      satRange: [0, 1],
      lightRange: [0, 1],
    };
  }

  componentWillMount() {
    FilterData.calculateData(videosData);
  }

  filter = (type, range) => {
    const state = this.state;
    this.state[type + 'Range'] = range;
    this.setState(state);
  }

  render() {
    let filteredVideos = FilterData.filterByHSL(videosData, this.state);
    let [groupedHues, groupedSat, groupedLight] = FilterData.groupHSL(filteredVideos);

    const videos = _.chain(filteredVideos)
      // .sortBy(video => -video.keepCount / video.totalCount)
      // .take(5)
      .map(video =>
        <Video key={video.id} data={video} filters={this.state} />).value();

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

    const barProps = {
      height: 60,
      width: 360,
      filterFunc: this.filter,
      filters: this.state,
    }

    // <div style={{padding: 20}}>
    //   <BarChart {...barProps} data={groupedHues} type='hue' />
    //   <BarChart {...barProps} data={groupedSat} type='sat' />
    //   <BarChart {...barProps} data={groupedLight} type='light' />
    // </div>
    // {videos}
    return (
      <div className="App">
        <SaturationGraph videos={filteredVideos} />
      </div>
    );
  }
}

export default App;
