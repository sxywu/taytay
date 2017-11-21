import _ from 'lodash';

const FilterData = {};
const hue = 0;

FilterData.filterByHue = (videos, hueRange) => {
  const [minHue, maxHue] = hueRange;
  _.each(videos, video => {
    const filteredFrames = _.map(video.frames, frame => {
      let colors = _.some(frame.colors, color => {
        return minHue <= color.color[hue] && color.color[hue] <= maxHue;
      });
      const groupByHue = colors ? frame.groupByHue : [];
      colors = colors ? frame.colors : [];

      return Object.assign(frame, {colors, groupByHue});
    });

    Object.assign(video, {filteredFrames});
  });
}

export default FilterData;
