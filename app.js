const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const Twitter = require('twit');
const listener = server.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
const config = require('./config/twitter_credentials');

app.use(express.static('frontend'));

const twitter = new Twitter(config);

io.on('connect', function(socket) {


  var stream = twitter.stream('statuses/filter', { q: 'JavaScript', language: 'en', locations:'-180,-90,180,90' })

  stream.on('tweet', function (tweet) {

    let tweetbody;
    if (tweet.place != undefined) {
      tweetbody = {
        'text': tweet.text,
        'userScreenName': "@" + tweet.user.screen_name,
        'userImage': tweet.user.profile_image_url_https,
        'userDescription': tweet.user.description,
        'coords': tweet.place.bounding_box.coordinates[0][0]
      };
      
      try {
        if(tweet.entities.media[0].media_url_https) {
          // console.log(tweet.entities.media[0].media_url_https);
        
          tweetbody['image'] = tweet.entities.media[0].media_url_https;
        }
      } catch(err) { }
    }
    
    io.emit('tweet', { 'tweet': tweetbody });
  });
});


