var fs = require('fs');
var https = require('https');
var request = require('request');

var key = fs.readFileSync('../key.txt', 'utf-8');
var videos = fs.readFileSync('../data/mv.json', 'utf-8');
videos = JSON.parse(videos);
var videoData = [];

function downloadImage(uri, filename, callback) {
  request.head(uri, function(err, res, body){
    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
}

function getVideoData(video) {
  // if we've gotten data for all videos
  // write to file and return
  if (!videos.length) {
    console.log(videoData);
    fs.writeFile('../data/youtube.json', JSON.stringify(videoData), 'utf-8');
    return;
  }

  var url = 'https://www.googleapis.com/youtube/v3/videos?&key=' +
    key + '&id=' + video['Youtube Id'] + '&part=snippet,statistics';

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

      // download thumbnail image
      downloadImage(snippet.thumbnails.standard.url,
        '../src/images/' + video['Youtube Id'] + '.jpg', () => console.log('done'));

      console.log('finished getting video: ' + video['Youtube Id']);
      // after we get the data, call function for next video
      video = videos.shift();
      getVideoData(video);
    });
  });
}

var video = videos.shift();
getVideoData(video);
