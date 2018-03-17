import React, { Component } from 'react';
import {scaleLinear, arc, max} from 'd3';
import _ from 'lodash';
import chroma from 'chroma-js';

const hueWidth = 300;
const perRow = 6;
const numDegrees = 10;
const width = hueWidth * perRow;

const heightScale = scaleLinear().range([0, 0.36 * hueWidth]);
const arcGenerator = arc();

class HueGraph extends Component {
  componentWillMount() {
    this.calculateData();
  }

  componentDidMount() {
    this.ctx = this.refs.canvas.getContext('2d');
    this.renderArcs();
  }

  calculateData() {
    this.videos = _.map(this.props.videos, video => {
      // get rid of light, dark, and gray colors
      const colors = _.filter(video.colors, color => color.color[1] > 0.25 &&
        0.2 < color.color[2] && color.color[2] < 0.8);
      // group into every 30 degrees
      return _.chain(colors)
        .groupBy(color => Math.floor(color.color[0] / numDegrees))
        .map((colors, i) => {
          const startAngle = (+i * numDegrees / 360) * 2 * Math.PI;
          const endAngle = startAngle + (numDegrees / 180) * Math.PI;
          const sum = _.sumBy(colors, 'size');
          colors = _.sortBy(colors, color => -color.color[2]); // sort by lightness
          return {startAngle, endAngle, sum, colors};
        }).value();
    });

    this.videos = _.map(this.videos, hues => {
      const maxHeight = max(hues, hue => hue.sum);
      heightScale.domain([0, maxHeight]);

      return _.chain(hues)
        .map(hue => {
          let outerRadius = 0.12 * hueWidth;

          return _.map(hue.colors, color => {
            const height = Math.max(heightScale(color.size), 1);
            const innerRadius = outerRadius - 0.5;
            outerRadius = innerRadius + height;
            return {
              innerRadius, outerRadius,
              startAngle: hue.startAngle,
              endAngle: hue.endAngle,
              color: color.color,
            }
          });
        }).flatten().value();
    });
  }

  renderArcs() {
    _.each(this.videos, (colors, i) => {
      let dx = hueWidth / 3;
      let dy = hueWidth / 2;
      if (i > 0) {
        // if not the first
        dx = (i % perRow === 0 ? 1 - perRow : 1) * hueWidth * (2 / 3); // if it's new row, go back
        dy = (i % perRow === 0) ? hueWidth : 0;
      }
      this.ctx.translate(dx, dy);

      _.each(colors, d => {
        this.ctx.beginPath();
        arcGenerator.context(this.ctx)(d);
        const [h, s, l] = d.color;
        this.ctx.fillStyle = chroma(h, s, l, 'hsl').css();
        this.ctx.fill();
      });

      // and then draw inner circle
      _.times(360 / numDegrees, i => {
        this.ctx.beginPath();

        const startAngle = (i * numDegrees / 360) * 2 * Math.PI - Math.PI / 2;
        const endAngle = startAngle + (numDegrees / 180) * Math.PI;
        this.ctx.arc(0, 0, 0.1 * hueWidth, startAngle, endAngle);
        this.ctx.strokeStyle = chroma(i * numDegrees, 0.5, 0.5, 'hsl').css();
        this.ctx.stroke();
      });
    });
  }

  render() {
    const style = {
      position: 'relative',
    };
    const height = Math.ceil(this.props.videos.length / perRow) * hueWidth;

    return (
      <div style={style}>
        <canvas ref='canvas' width={width} height={height} />
      </div>
    );
  }
}

export default HueGraph;
