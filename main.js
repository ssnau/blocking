var express = require("express");
var bodyParser = require('body-parser');
var uaParser = require('ua-parser');
var fs = require('fs');
var path = require('path');
var app = express();
var t = require('./t');
var util = require('./util');

app.use(bodyParser());

/* serves main page */
app.get("/", function(req, res) {
    res.sendfile('main.html');
});

app.get('/templates', function(req, res) {
    fs.readdir(path.join(__dirname, 'template'), function(err, files) {
        var filenames = files.map(function(name) {
            return path.basename(name);
        });
        res.send(filenames);
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
    var timestamp = req.body.timestamp || Date.now();
    t.reset(req.body.timestamp);
    var source = req.body.source;
    // 1. make version number after all request
    if (source.indexOf('{{no-cache}}')) {
        source = util.versionize(source);
    }
    // 2. add partial JS
    source = util.addJsPartial(source);

    source = source.replace('$start', timestamp);

    // 3. parse flush 
    
    if (/\{\{\s*flush\s+\d+\}\}/.test(source)) {
      util.handleFlushEarly(source, res);
      return;
    }

    // 4. send
    setTimeout(function() {
        res.send(source);
    }, 200);

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
