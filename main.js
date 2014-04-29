var express = require("express");
var bodyParser = require('body-parser');
var app = express();
var t = require('./t');
var util = require('./util');

app.use(bodyParser());

/* serves main page */
app.get("/", function(req, res) {
    res.sendfile('main.html')
});

app.post("/start", function(req, res) {
    res.set({
        'Content-Type': 'text/html',
        'X-XSS-Protection': '0'
    });
    t.reset();
    var source = req.body.source;
    // 1. make version number after all request
    source = util.versionize(source, (Date.now() + '').substring(5));
    // 2. add partial JS
    source = util.addJsPartial(source);
    // 3. send
    res.send(source);
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