var url = require("url"),
    path = require("path"),
    fs = require("fs"),
    imgBinary = fs.readFileSync(path.join(__dirname, "img.jpg")),
    startTime;

function type(pathname) {
    return path.extname(pathname).substring(1);
}

function makeHeader(pathname, res) {
    var heads = {
        "html": "text/html",
        "js": "text/javascript",
        "css": "text/css",
        "gif": "image/gif",
        "jpg": "image/jpeg",
        "png": "image/png"
    };
    var defaultHead = "application/octet-stream";

    res.writeHead(200, {
        "Content-Type": heads[type(pathname)] || defaultHead
    });
}

/**
 * Example:
 * - parseWaitTime('wait-3s.js') would return 3000
 * - parseWaitTime('wait-6s.css') would return 6000
 **/
function parseWaitTime(pathname) {
    try {
        return +(pathname.match(/wait-(\d+)s/)[1]) * 1000;
    } catch (e) {
        return 0;
    }
}

var template = {
    js: function(pathname) {
        var code = "g.log('execute ' + '$content');"
        return code.replace('$content', pathname);
    },
    css: function(pathname) {
        var match = pathname.match(/-([^-]*)\.css/);
        match = match ? match[1] : 'undefined';
        return "body {width:300px;height:300px;background:$bgcolor}".replace('$bgcolor', match);
    },
    jpg: function() {
        return imgBinary;
    }
};

function getSpentTime() {
    return "[" + (Date.now() - startTime) + "ms]";
}

function removeVersion(url) {
    return url.replace(/[?&]v=\d+/, '')
}


function log(text) {
    console.log(text);
}

function makeResponse(req, res) {
    var parsedUrl = url.parse(req.url, true); // true to get query as object
    var pathname = parsedUrl.pathname;
    var fileType = type(pathname);

    var waitTime = parseWaitTime(pathname);

    function send() {
        var templ = template[fileType] || function() {
                return '';
            };
        res.end(templ(pathname));
    }

    log(getSpentTime() + "[request] " + removeVersion(req.url));
    setTimeout(send, waitTime);
}


module.exports = {
    mw: function() {
        return function(req, res, next) {
            var parsedUrl = url.parse(req.url);

            makeHeader(parsedUrl.pathname, res);
            makeResponse(req, res);
        }
    },
    log: function() {
        return function(req, res, next) {
            log(getSpentTime() + "[client] " + req.param('text'));
            res.end();
        }
    },
    reset: function() {
        log('-----------------');
        startTime = Date.now();
    }
}