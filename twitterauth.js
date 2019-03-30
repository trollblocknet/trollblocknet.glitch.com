"use strict";

var Twitter = require('node-twitter-api');

module.exports = function(app) {
  
    var twitter = new Twitter({
      consumer_key: process.env.TWITTERAUTH_CONSUMER_KEY,
      consumer_secret: process.env.TWITTERAUTH_CONSUMER_SECRET,
      consumer_secret: process.env.TWITTERAUTH_CALLBACK
    });

    var _requestSecret;

    app.get("/request-token", function(req, res) {
        twitter.getRequestToken(function(err, requestToken, requestSecret) {
            if (err)
                res.status(500).send(err);
            else {
                _requestSecret = requestSecret;
                res.redirect("https://api.twitter.com/oauth/authenticate?oauth_token=" + requestToken);
            }
        });
    });
};