var express = require('express');
var app = express();
var request = require('request');
var async = require('async');

app.get('/', function(req, res){
   res.send("Hello world!");

});

app.get('/:username([a-zA-Z0-9_]+)\/followers', function(req, res, next){
   // var usersFollowersURL = 'https://api.github.com/users/' + req.params.username + '/followers'
   // var options = {
   //   url: usersFollowersURL,
   //   headers: {
   //     'User-Agent': 'vealjoshua'
   //   }
   // };
   // request.get(options, function (error, response, body) {
   //   console.log('error:', error); // Print the error if one occurred
   //   console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
   //   res.locals.followers = JSON.parse(body)
   //   // next()
   // });





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

          // res.locals.followers = JSON.parse(body)
          var jsonObj = JSON.parse(body);
          var stack = [];
          for (var i = 0; i < jsonObj.length && i < 5; i++) {
            stack.push(jsonObj[i]);
          }

          callback(null, stack);
      });
    },
    function getSecondLevelGithubFollowers(firstGithubFollowers, callback) {
        var secondLevelGithubFollowers = [];

        // for (var i = 0; i < firstGithubFollowers.length; i++) {
        //   firstGithubFollowers[i]

        //   var usersFollowersURL = 'https://api.github.com/users/' + firstGithubFollowers[i] + '/followers';
        //   var options = {
        //     url: usersFollowersURL,
        //     headers: {
        //       'User-Agent': 'vealjoshua'
        //     }
        //   };
        //   request.get(options, function(error, response, body) {
        //       if (error) {
        //         callback(error, null);
        //         console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        //         return;
        //       }

        //       var jsonObj = JSON.parse(body);
        //       for (var i = 0; i < jsonObj.length && i < 5; i++) {
        //         stack.push(jsonObj[i]);
        //       }
        //   });
        // }
        // callback(null, stack);


        async.each(firstGithubFollowers, function(follower, callback) {

          var usersFollowersURL = 'https://api.github.com/users/' + follower.login + '/followers';
          var options = {
            url: usersFollowersURL,
            headers: {
              'User-Agent': 'vealjoshua'
            }
          };
          request.get(options, function(error, response, body) {
              if (error) {
                callback(error, null);
                console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                return;
              }

              var jsonObj = JSON.parse(body);
              for (var i = 0; i < jsonObj.length && i < 5; i++) {
                secondLevelGithubFollowers.push(jsonObj[i]);
              }
              callback();
          });

        }, function(err) {
          if (err) {
            console.log("Async each failed.");
          } else {
            console.log('Second Level\n', secondLevelGithubFollowers);
            res.send(secondLevelGithubFollowers);
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


// }, function(req, res, next) {
//   // res.send(res.locals.followers)
//   console.log(res.locals.followers.length);
//   for (var i = 0; i < res.locals.followers.length && i < 5; i++) {
//     var usersFollowersURL = 'https://api.github.com/users/' + res.locals.followers[i].login + '/followers'
//     console.log(usersFollowersURL)
//     var options = {
//       url: usersFollowersURL,
//       headers: {
//         'User-Agent': 'vealjoshua'
//       }
//     }

//     request.get(options, function (error, response, body) {
//       console.log('error:', error); // Print the error if one occurred
//       console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
//       if (body != null) {
//         res.locals.followers2 = JSON.parse(body)
//       }
//     })

//     next()
//   }
// }, function(req, res) {
//   console.log("Last function: " + res.locals.followers2)
// })


app.listen(8080);
