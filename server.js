var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
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

function makeFileResponse(pathname, res) {
    // reset the startTime when the page is being requested
    startTime = Date.now();
    fs.exists(pathname, function(exists) {
        if (exists) {
            fs.readFile(pathname, function(err, data) {
                setTimeout(function() {
                    res.end(data);
                }, parseWaitTime(pathname));;
            });
        } else {
            res.writeHead(404, {
                "Content-Type": "text/html"
            });
            res.end("<h1>404 Not Found</h1>");
        }
    });
}

var template = {
    js: function(content) {
        var code = "window.log('$content');"
        return code.replace('$content', content);
    },
    css: function(bgcolor) {
        return "body {width:300px;height:300px;background:$bgcolor}".replace('$bgcolor', bgcolor);
    },
    jpg: function() {
        return fs.readFileSync(path.join(__dirname, "img.jpg"));
    }
};

function getSpentTime() {
    return "[" + (Date.now() - startTime) + "ms]";
}

function makeResponse(req, res) {
    var parsedUrl = url.parse(req.url, true); // true to get query as object
    var pathname = parsedUrl.pathname;
    var queryAsObject = parsedUrl.query;
    var fileType = type(pathname);

    var replacement = queryAsObject.content || queryAsObject.bgcolor;
    var waitTime = parseWaitTime(pathname);

    function send() {
        var templ = template[fileType] || function() {
                return '';
            };
        res.end(templ(replacement));
    }

    console.log(getSpentTime() + "[request]" + req.url);
    setTimeout(send, waitTime);
}

http.createServer(function(req, res) {
    var pathname = __dirname + url.parse(req.url).pathname,
        parsedUrl = url.parse(req.url, true),
        queryObject = parsedUrl.query;

    if (pathname.charAt(pathname.length - 1) == "/") {
        pathname = path.join(pathname, "index.html")
    }

    makeHeader(pathname, res);

    if (parsedUrl.pathname === '/log') {
        console.log(getSpentTime() + "[client]" + queryObject.text);
        res.end();
        return;
    }

    if (type(pathname) === 'html') {
        makeFileResponse(pathname, res);
    } else {
        makeResponse(req, res);
    }

}).listen(3000);

console.log("Server running at http://127.0.0.1:3000/");