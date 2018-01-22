import * as d3 from 'd3';
import _ from 'lodash';
import chroma from 'chroma-js';

const FilterData = {};
const hue = 0;
const saturation = 1;
const lightness = 2;
const hueStep = 5;

function groupByHue(colors) {
  const groupByHue = d3.nest()
    .key(d => _.floor(d.color[hue] / hueStep))
    .sortKeys((a, b) => {
      a = parseInt(a);
      b = parseInt(b);
      return d3.ascending(a, b);
    }).sortValues((a, b) => {
      a = a.color[lightness];
      b = b.color[lightness];
      return d3.descending(a, b);
    }).entries(colors);
  _.each(groupByHue, group => {
    Object.assign(group, {
      key: parseInt(group.key),
      hue: _.floor(group.values[0].color[hue] / 5) * 5,
      sum: _.sumBy(group.values, value => value.size),
    });
  });

  return groupByHue;
}

function groupBySaturation(colors) {
  const groupBySaturation = d3.nest()
    .key(d => _.floor(d.color[saturation] / 0.025))
    .sortKeys((a, b) => {
      a = parseFloat(a);
      b = parseFloat(b);
      return d3.ascending(a, b);
    }).sortValues((a, b) => d3.ascending(a.color[hue], b.color[hue]))
    .entries(colors);
  _.each(groupBySaturation, group => {
    Object.assign(group, {
      key: parseInt(group.key),
      saturation: _.floor(group.values[0].color[saturation] / 0.025) * 0.025,
      sum: _.sumBy(group.values, value => value.size),
    });
  });

  return groupBySaturation;
}

function groupByLightness(colors) {
  const groupByLightness = d3.nest()
    .key(d => _.floor(d.color[lightness] / 0.025))
    .sortKeys((a, b) => {
      a = parseFloat(a);
      b = parseFloat(b);
      return d3.ascending(a, b);
    }).sortValues((a, b) => d3.ascending(a.color[hue], b.color[hue]))
    .entries(colors);
  _.each(groupByLightness, group => {
    Object.assign(group, {
      key: parseInt(group.key),
      lightness: _.floor(group.values[0].color[lightness] / 0.025) * 0.025,
      sum: _.sumBy(group.values, value => value.size),
    });
  });

  return groupByLightness;
}

function groupByHueLightness(colors) {
  const groupByHueLightness = d3.nest()
    .key(d => _.floor(d.color[hue] / 45) * 10 + _.floor(d.color[lightness], 1) * 10)
    .sortKeys((a, b) => {
      a = parseFloat(a);
      b = parseFloat(b);
      return d3.ascending(a, b);
    }).sortValues((a, b) => {
      a = a.color[saturation];
      b = b.color[saturation];
      return d3.descending(a, b);
    }).entries(colors);
  _.each(groupByHueLightness, group => {
    Object.assign(group, {
      key: parseInt(group.key),
      hue: _.floor(group.values[0].color[hue] / 45) * 45,
      lightness: _.floor(group.values[0].color[lightness], 1),
      sum: _.sumBy(group.values, value => value.size),
    });
  });
  return groupByHueLightness;
}

FilterData.keepColor = (color, hueRange, satRange, lightRange) => {
  let keep = satRange[0] <= color[saturation] && color[saturation] <= satRange[1]
    && lightRange[0] <= color[lightness] && color[lightness] <= lightRange[1];
  if (hueRange[0] > hueRange[1]) {
    // if it wraps around
    keep = keep && (hueRange[0] <= color[hue] || color[hue] <= hueRange[1]);
  } else {
    keep = keep && hueRange[0] <= color[hue] && color[hue] <= hueRange[1];
  }
  return keep;
};

FilterData.calculateData = (videos) => {
  _.each(videos, video => {
    video.totalCount = 0;

    _.each(video.colors, color => {
      const hsl = chroma(color.color).hsl();
      hsl[0] = hsl[0] || 0; // if hue returns NaN
      Object.assign(color, {color: hsl});
    });
    Object.assign(video, {groupByHue: groupByHue(video.colors)});

    _.each(video.frames, frame => {
      frame.totalCount = 0;
      _.each(frame.colors, color => {
        const hsl = chroma(color.color).hsl();
        hsl[0] = hsl[0] || 0;
        Object.assign(color, {color: hsl});
        video.totalCount += color.size;
        frame.totalCount += color.size;
      });
      Object.assign(frame, {groupByHue: groupByHue(frame.colors)});
    });
  });
}

FilterData.filterByHSL = (videos, ranges) => {
  const {hueRange, satRange, lightRange} = ranges;
  const filteredVideos = [];
  _.each(videos, video => {
    // go through all colors to see if it falls in the ranges
    video.keepCount = 0;

    _.each(video.groupByHue, hue => {
      _.each(hue.values, color => {
        color.keep = FilterData.keepColor(color.color, hueRange, satRange, lightRange);
      });
    });

    _.each(video.frames, frame => {
      frame.keepCount = 0;
      _.each(frame.groupByHue, hue => {
        _.each(hue.values, color => {
          color.keep = FilterData.keepColor(color.color, hueRange, satRange, lightRange);

          video.keepCount += color.keep ? color.size : 0;
          frame.keepCount += color.keep ? color.size : 0;
        });
      });
    });

    if (video.keepCount) {
      filteredVideos.push(video);
    }
  })

  return filteredVideos;
};

// group the filtered colors by their hue, step =
FilterData.groupHSL = (videos, type) => {
  const colors = [];
  _.each(videos, video => {
    _.each(video.frames, frame => {
      _.each(frame.colors, color => {
        if (color.keep) {
          colors.push(color);
        }
      });
    });
  });

  return [groupByHue(colors), groupBySaturation(colors), groupByLightness(colors)];
}

export default FilterData;
