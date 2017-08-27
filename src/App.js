import React, { Component } from 'react';
import * as d3 from 'd3';
import logo from './logo.svg';
import './App.css';

import imageUrl from './images/taytay.png';
var imageWidth = 848;
var imageHeight = 437;

class App extends Component {

  componentDidMount() {
    this.canvas = d3.select(this.refs.canvas);
    this.ctx = this.refs.canvas.getContext('2d');
    // set canvas width & height
    this.refs.canvas.width = imageWidth;
    this.refs.canvas.height = imageHeight;

    var img = new Image();
    img.onload = () => {
      this.ctx.drawImage(img, 0, 0, imageWidth, imageHeight);
    }
    img.src = imageUrl;
  }

  render() {
    return (
      <div className="App">
        <canvas ref='canvas' />
      </div>
    );
  }
}

export default App;
