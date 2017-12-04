import * as d3 from 'd3';
import _ from 'lodash';
import chroma from 'chroma-js';

const FilterData = {};
const hue = 0;
const saturation = 1;
const lightness = 2;

function groupByHue(colors) {
  const groupByHue = d3.nest()
    .key(d => _.floor(d.color[hue] / 5))
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

function keepColor(color, hueRange, satRange, lightRange) {
  return hueRange[0] <= color[hue] && color[hue] <= hueRange[1]
    && satRange[0] <= color[saturation] && color[saturation] <= satRange[1]
    && lightRange[0] <= color[lightness] && color[lightness] <= lightRange[1];
};

FilterData.calculateData = (videos) => {
  _.each(videos, video => {
    _.each(video.colors, color => {
      Object.assign(color, {color: chroma(color.color).hsl()});
    });
    Object.assign(video, {groupByHue: groupByHue(video.colors)});

    _.each(video.frames, frame => {
      _.each(frame.colors, color => {
        Object.assign(color, {color: chroma(color.color).hsl()});
      });
      Object.assign(frame, {groupByHue: groupByHue(frame.colors)});
    });
  });
}

FilterData.filterByHSL = (videos, ranges) => {
  const {hueRange, satRange, lightRange} = ranges;
  _.each(videos, video => {
    // go through all colors to see if it falls in the ranges
    _.each(video.groupByHue, hue => {
      _.each(hue.values, color => {
        color.keep = keepColor(color.color, hueRange, satRange, lightRange);
      });
    });

    _.each(video.frames, frame => {
      _.each(frame.groupByHue, hue => {
        _.each(hue.values, color => {
          color.keep = keepColor(color.color, hueRange, satRange, lightRange);
        });
      });
    });
  })
};

// FilterData.filterByHue = (videos, hueRange) => {
//   const [minHue, maxHue] = hueRange;
//   _.each(videos, video => {
//     const filteredColors = _.filter(video.colors, color => {
//       return minHue <= color.color[hue] && color.color[hue] <= maxHue;
//     });
//     Object.assign(video, {
//       filteredColors,
//       groupByHue: groupByHue(filteredColors)
//     });
//
//     _.each(video.frames, frame => {
//       const filteredColors = _.filter(frame.colors, color => {
//         return minHue <= color.color[hue] && color.color[hue] <= maxHue;
//       });
//       Object.assign(frame, {
//         filteredColors,
//         groupByHue: groupByHue(filteredColors)
//       });
//     });
//   });
// }
//
// FilterData.filterByLightness = (videos, lightnessRange) => {
//   const [minLight, maxLight] = lightnessRange;
//   _.each(videos, video => {
//     const filteredColors = _.filter(video.filteredColors, color => {
//       return minLight <= color.color[lightness] &&
//         color.color[lightness] <= maxLight;
//     });
//     Object.assign(video, {
//       filteredColors,
//       groupByHue: groupByHue(filteredColors)
//     });
//
//     _.each(video.frames, frame => {
//       const filteredColors = _.filter(frame.filteredColors, color => {
//         return minLight <= color.color[lightness] &&
//           color.color[lightness] <= maxLight;
//       });
//       Object.assign(frame, {
//         filteredColors,
//         groupByHue: groupByHue(filteredColors)
//       });
//     });
//   });
// }
//
// FilterData.filterBySaturation = (videos, saturationRange) => {
//   const [minSat, maxSat] = saturationRange;
//   _.each(videos, video => {
//     const filteredColors = _.filter(video.filteredColors, color => {
//       return minSat <= color.color[saturation] &&
//         color.color[saturation] <= maxSat;
//     });
//     Object.assign(video, {
//       filteredColors,
//       groupByHue: groupByHue(filteredColors)
//     });
//
//     _.each(video.frames, frame => {
//       const filteredColors = _.filter(frame.filteredColors, color => {
//         return minSat <= color.color[saturation] &&
//           color.color[saturation] <= maxSat;
//       });
//       Object.assign(frame, {
//         filteredColors,
//         groupByHue: groupByHue(filteredColors)
//       });
//     });
//   });
// }

export default FilterData;
