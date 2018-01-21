// var window = {};
// importScripts('https://wzrd.in/standalone/gpu.js@latest');

// const gpu = new window.GPU();
function rgb2l(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  var min = r;
  if (g < min) {
    min = g;
  }
  if (b < min) {
    min = b;
  }
  var max = r;
  if (g > max) {
    max = g;
  }
  if (b > max) {
    max = b;
  }

  return (min + max) / 2;
}

function rgb2s(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  var min = r;
  if (g < min) {
    min = g;
  }
  if (b < min) {
    min = b;
  }
  var max = r;
  if (g > max) {
    max = g;
  }
  if (b > max) {
    max = b;
  }

  var s = 0;
  if (min !== max) {
    if ((min + max) / 2 < 0.5) {
      s = (max - min) / (max + min);
    } else {
      s = (max - min) / (2 - max - min);
    }
  }
  return s;
}

function rgb2h(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  var min = r;
  if (g < min) {
    min = g;
  }
  if (b < min) {
    min = b;
  }
  var max = r;
  if (g > max) {
    max = g;
  }
  if (b > max) {
    max = b;
  }

  var h = 0;
  // calculate hue
  if (r === max) {
    h = (g - b) / (max - min);
  } else if (g == max) {
    h = 2 + (b - r) / (max - min);
  } else if (b == max) {
    h = 4 + (r - g) / (max - min);
  }
  h *= 60;
  if (h < 0) {
    h += 360;
  }
  return h;
}

function keepColor(h, s, l, hueRange, satRange, lightRange) {
  // in saturation range
  if (s < satRange[0]) return 0;
  if (satRange[1] < s) return 0;
  // in lightness range
  if (l < lightRange[0]) return 0;
  if (lightRange[1] < l) return 0;
  // now see if in hue range
  if (hueRange[0] > hueRange[1]) {
    // if it wraps around
    var keep = 0;
    if (hueRange[0] <= h) keep += 1;
    if (h <= hueRange[1]) keep += 1;
    if (keep < 2) return 0;
  } else {
    if (h < hueRange[0]) return 0;
    if (hueRange[1] < h) return 0;
  }
  return 1;
}

// const filterImageGPU = gpu.createKernel(function(pixels, imageWidth, hueRange, satRange, lightRange) {
//   var x = this.thread.y;
//   var y = this.thread.z;
//   var index = this.thread.x;
//   var offset = x * 4 + y * 4 * imageWidth;
//   var r = pixels[offset];
//   var g = pixels[offset + 1];
//   var b = pixels[offset + 2];
//
//   var h = rgb2h(r, g, b);
//   var s = rgb2s(r, g, b);
//   var l = rgb2l(r, g, b);
//   var keep = keepColor(h, s, l, hueRange, satRange, lightRange);
//
//   if (index === 3) {
//     return 255;
//   } else if (keep == 1) {
//     return pixels[offset + index];
//   } else {
//     return 0.21 * r + 0.72 * g + 0.07 * b;
//   }
// }).setFunctions([rgb2h, rgb2s, rgb2l, keepColor]);

function filterImage(pixels, imageWidth, imageHeight, hueRange, satRange, lightRange) {
  const filteredPixels = [];
  let offset = 0;
  for (i = 0; i < (imageWidth * imageHeight); i += 1) {
    offset = i * 4;
    var r = pixels[offset];
    var g = pixels[offset + 1];
    var b = pixels[offset + 2];

    var h = rgb2h(r, g, b);
    var s = rgb2s(r, g, b);
    var l = rgb2l(r, g, b);
    var keep = keepColor(h, s, l, hueRange, satRange, lightRange);

    if (!keep) {
      r = g = b = 0.21 * r + 0.72 * g + 0.07 * b;
    }

    filteredPixels.push(r);
    filteredPixels.push(g);
    filteredPixels.push(b);
    filteredPixels.push(255);
  }

  return filteredPixels
}

onmessage = function(event) {
  const data = event.data;

  // filterImageGPU.setOutput([4, data.imageWidth, data.imageHeight]);

  // go through all images
  const allImagesPixels = data.imageData.map(imageDatum => {
    return filterImage(
      imageDatum.data,
      data.imageWidth,
      data.imageHeight,
      data.filters.hueRange,
      data.filters.satRange,
      data.filters.lightRange
    );
  });

  this.postMessage({allImagesPixels});
}
