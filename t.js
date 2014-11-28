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
        return +parseFloat(pathname.match(/wait-([0-9.]+)s/)[1]) * 1000;
    } catch (e) {
        return 0;
    }
}

/**
 * just like parseWaitTime.
 * @param  {[type]} pathname
 * @return {[type]}
 */
function parseBusyTime(pathname) {
    try {
        return +(pathname.match(/busy-(\d+)s/)[1]) * 1000;
    } catch (e) {
        return 0;
    }
}

function replace(str, config) {
    for (key in config) {
        str = str.replace(new RegExp('\\$' + key, 'g'), config[key]);
    }
    return str;
}

var template = {
    js: function(pathname) {
        var code = "g.log('execute ' + '$pathname');"
        var busy = parseBusyTime(pathname);

        if (busy) {
            code = fs.readFileSync(path.join(__dirname, 'partial/busy.js'), 'utf8');
        }

        return replace(code, {
            'pathname': pathname,
            'busy': busy
        });
    },
    css: function(pathname) {
        var match = pathname.match(/-([^-]*)\.css/);
        match = match ? match[1] : 'undefined';

        function getSp(i) {
            return '.sp#i {width:300px;height:300px;background:url(/t/sp-wait-#is.jpg)}'.replace(/#i/g, i);
        }

        var source = [
            '.body {width:300px;height:300px;background:$bgcolor}',
            getSp(0), getSp(1), getSp(2), getSp(3), getSp(4), getSp(5),
            getSp(6), getSp(7), getSp(8), getSp(9), getSp(10)
            ].join('\n');

        // add version number for image and replace bgcolor
        return source.replace(/\.jpg/g, function() {
                return '.jpg?v=' + Math.floor(Math.random() * 10000) + '' + Date.now();
            }).replace('$bgcolor', match);
    },
    jpg: function() {
        return imgBinary;
    },
    html: function () {
      return "<h1>hello world</h1>";
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
            log(req.param('text'));
            res.end();
        }
    },
    reset: function(timestamp) {
        startTime = timestamp || Date.now();
    }
}
