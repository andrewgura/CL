var express = require('express');
var app = express();

app.get('/', function(req, res){
   res.send("Hello world!");

});

app.get('/:userId([a-zA-Z0-9_]+)\/followers', function(req, res){
   res.send(req.params);

});


app.listen(8080);
