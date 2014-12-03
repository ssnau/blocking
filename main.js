var express = require("express");
var bodyParser = require('body-parser');
var uaParser = require('ua-parser');
var fs = require('fs');
var path = require('path');
var app = express();
var t = require('./t');
var util = require('./util');
var contentPath = path.join(__dirname, '_content');


// make dir if not exist
if (!fs.existsSync(contentPath)) {
  fs.mkdirSync(contentPath); 
}

app.use(bodyParser());

/* serves main page */
app.get("/", function(req, res) {
    res.sendfile('main.html');
});

app.get("/edit/:id", function(req, res) {
    res.sendfile('main.html');
});

app.get('/sources/:id', function(req, res) {
  util.getFileSource(req.params.id, function(err, content) {
    if (err) {
      res.send(404, 'source file not found');
      return;
    }

    res.send(content);
  });
});
app.get('/templates', function(req, res) {
    fs.readdir(path.join(__dirname, 'template'), function(err, files) {
        var filenames = files.map(function(name) {
            return path.basename(name);
        });
        res.send(filenames);
    });
});

app.get("/page/:id", function(req, res) {
    util.getFileSource(req.params.id, function(err, content) {
      if (err) {
        res.send(404, "Your requesting is illegal...");
        return;
      }
      util.handleSource(content, res);
    });
});

app.post("/start", function(req, res) {
    // log browser info
    console.log('--------------');
    var r = uaParser.parse(req.get('User-Agent'))
    console.log(r.ua.toString() + " on " + r.os.toString());
    console.log('--------------');

    res.set({
        'Content-Type': 'text/html',
        'X-XSS-Protection': '0'
    });
    var source = req.body.source;
    var filename = util.randomFilename();
    fs.writeFile(path.join(contentPath, filename + ".source"), source, function(err, data){
      if (err) return;
      console.log("it saved");
      res.redirect('/page/' + filename);
    });
});

app.get('/log', t.log());

app.get(/^\/t\/.*/, t.mw());

/* serves all the static files */
app.get(/^(.+)$/, function(req, res) {
    //console.log('static file request : ' + req.params);
    res.sendfile(__dirname + req.params[0]);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
    console.log("Listening on " + port);
});
