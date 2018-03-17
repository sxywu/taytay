import React, { Component } from 'react';
import {scaleLinear, arc, max, select} from 'd3';
import _ from 'lodash';
import chroma from 'chroma-js';

const hueWidth = 300;
const perRow = 6;
const numDegrees = 10;
const margin = {left: 30, top: 20, right: 5, bottom: 20};

const heightScale = scaleLinear().range([0, 0.36 * hueWidth]);
const arcGenerator = arc();

class HueGraph extends Component {
  componentWillMount() {
    this.calculateData();
  }

  componentDidMount() {
    this.ctx = this.refs.canvas.getContext('2d');
    this.svg = select(this.refs.svg);
    this.renderArcs();
    this.renderTitles();
  }

  calculateData() {
    this.groups = _.chain(this.props.videos)
      .groupBy(video => video.album).sortBy(videos => videos[0].year)
      .map((videos, i) => {
        videos = _.map(videos, (video, j) => {
          return {
            x: (j + 0.75) * hueWidth / 2,
            colors: video.colors,
            title: video.title,
            album: video.album,
          };
        });
        return {y: (i + 0.5) * hueWidth, videos};
      }).value();

    this.videos = _.chain(this.groups)
      .map(group => {
        return _.map(group.videos, (video, i) => {
          // get rid of light, dark, and gray colors
          let colors = _.filter(video.colors, color => color.color[1] > 0.2 &&
            0.2 < color.color[2] && color.color[2] < 0.8);
          // group into degrees
          const hues = _.chain(colors)
            .groupBy(color => Math.floor(color.color[0] / numDegrees))
            .map((colors, i) => {
              const startAngle = (+i * numDegrees / 360) * 2 * Math.PI;
              const endAngle = startAngle + (numDegrees / 180) * Math.PI;
              const sum = _.sumBy(colors, 'size');
              colors = _.sortBy(colors, color => -color.color[2]); // sort by lightness
              return {startAngle, endAngle, sum, colors};
            }).value();

          const maxHeight = max(hues, hue => hue.sum);
          heightScale.domain([0, maxHeight]);

          // calculate the positions of each color as they're grouped into hues
          // but then return flattened so it's all the colors for the video again
          colors = _.chain(hues)
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

          return {x: video.x, y: group.y, colors};
        });
      }).flatten().value();
  }

  renderArcs() {
    let x = 0;
    let y = 0;
    _.each(this.videos, video => {
      const dx = video.x - x;
      const dy = video.y - y;
      this.ctx.translate(dx, dy);
      x = video.x;
      y = video.y;

      // first draw bg circles
      _.times(1, i => {
        const radius = i * (hueWidth * 0.16) + (hueWidth * 0.1);
        _.times(360 / numDegrees, i => {
          this.ctx.beginPath();

          const startAngle = (i * numDegrees / 360) * 2 * Math.PI - Math.PI / 2;
          const endAngle = startAngle + (numDegrees / 180) * Math.PI;
          this.ctx.lineWidth = 0.5;
          this.ctx.arc(0, 0, radius, startAngle, endAngle);
          this.ctx.strokeStyle = chroma(i * numDegrees, 0.5, 0.5, 'hsl').css();
          this.ctx.stroke();
        });
      })

      // draw all the colors
      _.each(video.colors, d => {
        this.ctx.beginPath();
        arcGenerator.context(this.ctx)(d);
        const [h, s, l] = d.color;
        this.ctx.fillStyle = chroma(h, s, l, 'hsl').css();
        this.ctx.fill();
      });


    });
  }

  renderTitles() {
    const fontSize = 10;
    const group = this.svg.selectAll('.group')
      .data(this.groups).enter().append('g')
      .classed('group', true)
      .attr('transform', d => `translate(0, ${d.y})`);

    const titles = group.selectAll('.title')
      .data(d => d.videos).enter().append('g')
      .classed('title', true)
      .attr('transform', d => `translate(${d.x}, 0)`);

    titles.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '.35em')
    .attr('font-size', fontSize)
    .text(d => _.truncate(d.title, {length: 24, omission: ' ..'}))
    .each(function(d) {
      d.width = this.getBoundingClientRect().width;
    });

    titles.insert('rect', 'text')
      .attr('width', d => d.width + 2)
      .attr('x', d => -d.width / 2 - 1)
      .attr('height', fontSize + 2)
      .attr('y', -fontSize / 2 - 1)
      .attr('fill', 'rgba(255, 255, 255, 0.5)');

  }

  render() {
    const style = {
      position: 'relative',
    };
    const svgStyle = {
      position: 'absolute',
      top: 0, left: 0,
    }

    const maxLength = max(this.groups, group => group.videos.length);
    const width = maxLength * (hueWidth * 2 / 3);
    const height = this.groups.length * hueWidth;

    return (
      <div style={style}>
        <canvas ref='canvas' width={width} height={height} />
        <svg ref='svg' style={svgStyle} width={width} height={height} />
      </div>
    );
  }
}

export default HueGraph;
