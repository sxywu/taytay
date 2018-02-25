import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import chroma from 'chroma-js';

const hue = 0;
const sat = 1;
const light = 2;

const width = 200;
const blockWidth = 10;
const perRow = width / blockWidth;
let perSquare = 0;

class Block extends Component {

  componentDidMount() {
    this.canvas = d3.select(this.refs.canvas);
    this.ctx = this.refs.canvas.getContext('2d');

    this.calculateData();
  }

  componentDidUpdate() {
    this.calculateData();
  }

  calculateData() {
    perSquare = Math.sqrt(this.props.totalCount);
    perSquare = Math.floor(perSquare);

    const blacks = [];
    const whites = [];
    const grays = [];
    const colors = [];
    _.each(this.props.colors, color => {
      if (color.color[light] < 0.15) {
        blacks.push(color);
      } else if (color.color[light] > 0.85) {
        whites.push(color);
      } else if (color.color[sat] < 0.07) {
        grays.push(color);
      } else {
        colors.push(color);
      }
    });

    let x = 0;
    let y = 0;
    [x, y] = this.renderColors(blacks, null, x, y);
    [x, y] = this.renderColors(grays, null, x + 10, y + 10);
    [x, y] = this.renderColors(whites, null, x + 10, y + 10);
    [x, y] = this.renderColors(colors, null, x + 10, y + 10);
  }

  renderColors(colors, renderColor, x, y) {
    _.chain(colors)
      .sortBy(color => {
        const [h, s, l] = color.color;
        return Math.floor(h / 40) * 40 + l;
      })
      .each(color => {
        _.times(_.ceil(color.size / perSquare), i => {
          const [h, s, l] = color.color;

          let blockHeight = blockWidth;
          const remaining = color.size - i * perSquare;
          if (remaining < perSquare) {
            // if this block should only be partially filled, calculalte its height
            blockHeight *= (remaining / perSquare);
          }

          this.ctx.fillStyle = renderColor || chroma(h, s, l, 'hsl').hex();
          this.ctx.strokeStyle = this.ctx.fillStyle;
          this.ctx.fillRect(x, y, blockWidth, blockHeight);
          this.ctx.strokeRect(x, y, blockWidth, blockHeight);

          y += blockHeight;
          if (y > width) {
              x += blockWidth;
              y = 0;
            }
        });
      }).value();

    return [x, y];
  }

  render() {
    return (
      <canvas ref='canvas' width={width} height={width} />
    )
  }
}

export default Block;
