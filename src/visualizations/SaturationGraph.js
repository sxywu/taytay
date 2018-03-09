import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import Beeswarms from './Beeswarms';

const songWidth = 25;
const height = 400;
const margin = {left: 30, top: 20, right: 5, bottom: 20};
const yScale = d3.scaleLinear().range([height - margin.bottom, margin.top]);
const line = d3.line().x(d => d.x).y(d => d.y);

class SaturationGraph extends Component {
  componentWillMount() {
    this.calculateData();
  }

  componentDidMount() {
    this.svg = d3.select(this.refs.svg);
    this.renderMedians();
  }

  calculateMedianWithSize(colors) {
    const total = _.sumBy(colors, 'size');
    let sum = 0;
    return _.find(colors, d => {
        sum += d.size;
        if (sum >= total / 2) return true;
        return false;
      });
  }

  calculateData() {
    let x = 0;
    this.groups = _.chain(this.props.videos)
      .groupBy(video => video.album).sortBy(videos => videos[0].year)
      .map((videos, i) => {
        x += margin.left;
        const group = {x, videos};
        x += videos.length * songWidth;
        return group;
      }).value();

    this.swarms = _.chain(this.groups)
      .map(group => {
        return _.map(group.videos, (video, i) => {
          const x = group.x + i * songWidth;
          return _.chain(video.colors)
            .filter(color => 0.2 < color.color[2] && color.color[2] < 0.8)
            .sortBy(color => -color.size).take(Math.floor(0.25 * video.colors.length))
            .map(color => Object.assign(color, {bounds: [x, x + songWidth]}))
            .value();
        });
      }).flattenDeep().value();

    const allSats = [];
    this.medians = _.chain(this.groups)
      .map(group => {
        const videos = _.map(group.videos, (video, i) => {
          const colors = _.chain(video.colors)
            .filter(d => 0.2 < d.color[2] && d.color[2] < 0.8)
            .sortBy(d => d.color[1]).value();
          const medianColor = this.calculateMedianWithSize(colors);
          const y = yScale(medianColor.color[1]);

          allSats.push(y);
          return {
            title: video.title,
            x: group.x + (i + 0.5) * songWidth,
            y,
          };
        });
        return {
          album: group.videos[0].album,
          bounds: [group.x, group.x + videos.length * songWidth],
          videos,
        }
      }).value();

    // let overall = _.sortBy(allSats);
    this.overallMedian = this.calculateMedianWithSize(this.swarms);
    this.overallMedian = yScale(this.overallMedian.color[1]);
  }

  renderMedians() {
    this.svg.append('line')
      .attr('x1', this.medians[0].bounds[0])
      .attr('x2', _.last(this.medians).bounds[1])
      .attr('y1', this.overallMedian)
      .attr('y2', this.overallMedian)
      .attr('stroke', '#333')
      // .attr('stroke-width', 2)
      // .attr('opacity', 0.5)
      // .attr('stroke-dasharray', '5 2');

    const inbetween = [];
    _.each(this.medians, (group, i) => {
      if (i === 0) return;
      const prev = _.last(this.medians[i - 1].videos);
      const current = group.videos[0];
      inbetween.push({
        x1: prev.x, y1: prev.y,
        x2: current.x, y2: current.y,
      })
    });
    this.svg.selectAll('.inbetween')
      .data(inbetween).enter().append('line')
      .classed('inbetween', true)
      .attr('x1', d => d.x1)
      .attr('x2', d => d.x2)
      .attr('y1', d => d.y1)
      .attr('y2', d => d.y2)
      .attr('stroke', '#333')
      .attr('stroke-dasharray', '2 2');

    const medians = this.svg.selectAll('.lines')
      .data(this.medians).enter().append('g')
      .classed('lines', true);

    medians.append('path')
      .datum(d => d.videos)
      .attr('fill', 'none')
      .attr('d', line)
      .attr('stroke', '#333')
      .attr('stroke-width', 2);

    medians.selectAll('circle')
      .data(d => d.videos).enter().append('circle')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', 4)
      .attr('fill', '#fff')
      .attr('stroke', '#333')
      .attr('stroke-width', 2);

    const fontSize = 12;
    medians.append('text')
      .attr('x', d => (d.bounds[0] + d.bounds[1]) / 2)
      .attr('y', height + fontSize)
      .attr('dy', '.35em')
      .attr('text-anchor', 'middle')
      .attr('font-size', fontSize)
      .text(d => d.album);

    medians.append('line')
      .attr('x1', d => d.bounds[0])
      .attr('y1', height + 2 * fontSize)
      .attr('x2', d => d.bounds[1])
      .attr('y2', height + 2 * fontSize)
      .attr('stroke', '#333');

    medians.selectAll('.title')
      .data(d => d.videos).enter().append('text')
      .classed('title', true)
      .attr('transform', (d, i) =>
        `translate(${d.x}, ${height + 2.5 * fontSize})rotate(-90)`)
      .attr('text-anchor', 'end')
      .attr('dy', '.35em')
      .attr('font-size', fontSize)
      .text(d => d.title);
  }

  render() {
    const style = {
      position: 'relative',
    };

    const beeswarmsProps = {
      songWidth,
      width: this.groups.length * margin.left + this.props.videos.length * songWidth,
      height,
      data: this.swarms,
      yScale,
    }
    return (
      <div style={style}>
        <Beeswarms {...beeswarmsProps} />
        <svg ref='svg' style={{width: '100%', height: '200%', position: 'absolute', top: 0, left: 0}} />
      </div>
    );
  }
}

export default SaturationGraph;
