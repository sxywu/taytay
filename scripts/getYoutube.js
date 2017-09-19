var fs = require('fs');
var https = require('https');

var key = fs.readFileSync('../key.txt', 'utf-8');
var videos = fs.readFileSync('../data/mv.json', 'utf-8');
videos = JSON.parse(videos);

// var options = {
//   host: 'https://www.googleapis.com',
//   path: '/youtube/v3/videos?&key=' + key + '&id=' + videos[0] + '&part=snippet,statistics',
// };

var url = 'https://www.googleapis.com/youtube/v3/videos?&key=' +
  key + '&id=' + videos[0]['Youtube Id'] + '&part=snippet,statistics';
var videoData = [];

https.get(url, res => {
  res.setEncoding('utf8');

  var data = '';
  res.on('data', chunk => {
    data += chunk;
  })
  res.on('end', () => {
    data = JSON.parse(data);
    var {snippet, statistics} = data.items[0];
    videoData.push({snippet, statistics});
    console.log(videoData)
  })
});
