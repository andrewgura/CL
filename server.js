var express = require('express')
var app = express()
var request = require('request')

app.get('/', function(req, res){
   res.send("Hello world!")

})

app.get('/:username([a-zA-Z0-9_]+)\/followers', function(req, res, next){
   var usersFollowersURL = 'https://api.github.com/users/' + req.params.username + '/followers'
   var options = {
     url: usersFollowersURL,
     headers: {
       'User-Agent': 'vealjoshua'
     }
   }
   request.get(options, function (error, response, body) {
     console.log('error:', error); // Print the error if one occurred
     console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
     // res.send(body);
     res.locals.followers = body;
     next()
   })

}, function(req, res) {
  res.send(res.locals.followers)
  console.log("This is the next function.");
})


app.listen(8080);
