var express = require('express');
var app = express();
var request = require('request');
var async = require('async');

app.get('/', function(req, res){
  res.sendFile(__dirname + '/README.md');
});

var firstLevelGithubFollowers = [];
var secondLevelGithubFollowers = [];
var thirdLevelGithubFollowers = [];
var userRepos = [];
var starGazers = [];

app.get('/:username([a-zA-Z0-9_]+)\/followers', function(req, res){

   async.waterfall ([
    function getFirstLevelGithubFollowers(callback) {
      var usersFollowersURL = 'https://api.github.com/users/' + req.params.username + '/followers';
      var options = {
        url: usersFollowersURL,
        headers: {
          'User-Agent': 'vealjoshua'
        }
      };
      request.get(options, function (error, response, body) {
        if (error) {
          callback(error, null);
          console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
          return;
        }

          firstLevelGithubFollowers = [];
          var jsonObj = JSON.parse(body);
          for (var i = 0; i < jsonObj.length && i < 5; i++) {
            firstLevelGithubFollowers.push(jsonObj[i]);
          }

          callback(null, firstLevelGithubFollowers);
      });
    },
    function getSecondLevelGithubFollowers(firstGithubFollowers, callback) {

        async.each(firstGithubFollowers, function(follower, callback) {

          var usersFollowersURL = 'https://api.github.com/users/' + follower.login + '/followers';
          var options = {
            url: usersFollowersURL,
            headers: {
              'User-Agent': 'vealjoshua'
            }
          };

          follower.second_level_followers = [];
          request.get(options, function(error, response, body) {
              if (error) {
                callback(error, null);
                console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                return;
              }

              secondLevelGithubFollowers = [];
              var jsonObj = JSON.parse(body);
              for (var i = 0; i < jsonObj.length && i < 5; i++) {
                follower.second_level_followers.push(jsonObj[i]);
                secondLevelGithubFollowers.push(jsonObj[i]);
              }
              callback();
          });

        }, function(err) {
          if (err) {
            console.log("Async each failed.");
          } else {
            callback(null, secondLevelGithubFollowers);
          }
        });
    },
    function getThirdLevelGithubFollowers(secondGithubFollowers, callback) {
        async.each(secondGithubFollowers, function(follower, callback) {
          var usersFollowersURL = 'https://api.github.com/users/' + follower.login + '/followers';
          var options = {
            url: usersFollowersURL,
            headers: {
              'User-Agent': 'vealjoshua'
            }
          };
          follower.third_level_followers = [];
          request.get(options, function(error, response, body) {
              if (error) {
                callback(error, null);
                console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                return;
              }

              var jsonObj = JSON.parse(body);
              for (var i = 0; i < jsonObj.length && i < 5; i++) {
                follower.third_level_followers.push(jsonObj[i]);
                thirdLevelGithubFollowers.push(jsonObj[i]);
              }

              callback();
          });

        }, function(err) {
            if (err) {
              console.log("Async each failed.");
            } else {
              res.send(firstLevelGithubFollowers);
            }
        });
    }

    ], function(err, result) {
        if (err) {
          console.error(err);
          return;
        }
        
        console.log(result);
        res.send(result);
    });
});

app.get('/:username([a-zA-Z0-9_]+)\/repos', function(req, res){
  async.waterfall ([
    function getRepos(callback) {
      var userReposURL = 'https://api.github.com/users/' + req.params.username + '/repos';
      var options = {
        url: userReposURL,
        headers: {
          'User-Agent': 'vealjoshua'
        }
      };

      request.get(options, function (error, response, body) {
        if (error) {
          callback(error, null);
          console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
          return;
        }

        userRepos = [];
        var jsonObj = JSON.parse(body);
        for (var i = 0; i < jsonObj.length && i < 3; i++) {
          userRepos.push(jsonObj[i]);
        }

        // res.send(userRepos);
        callback(null, userRepos);
      });
    },

    function getStarGazers(repos, callback) {
      async.each(repos, function(repo, callback) {

        var userStarGazersURL = 'https://api.github.com/repos/' + req.params.username + '/' + repo.name + '/stargazers';
        console.log(userStarGazersURL);
          var options = {
            url: userStarGazersURL,
            headers: {
              'User-Agent': 'vealjoshua'
            }
          };
        repo.stargazers = [];

        request.get(options, function(error, response, body) {
              if (error) {
                callback(error, null);
                console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                return;
              }

              var jsonObj = JSON.parse(body);
              for (var i = 0; i < jsonObj.length && i < 3; i++) {
                repo.stargazers.push(jsonObj[i]);
                starGazers.push(jsonObj[i]);
              }

              callback();
        });
      }, function(err) {
            if (err) {
              console.log("Async each failed.");
            } else {
              res.send(userRepos);
            }
        });
    }
  ], function(err, result) {
        if (err) {
          console.error(err);
          return;
        }
        
        console.log(result);
        res.send(result);
    });
});

app.listen(8080);
