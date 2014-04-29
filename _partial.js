var g = {};

g.send = (function() {
    var XMLHttpFactories = [

        function() {
            return new XMLHttpRequest()
        },
        function() {
            return new ActiveXObject("Msxml2.XMLHTTP")
        },
        function() {
            return new ActiveXObject("Msxml3.XMLHTTP")
        },
        function() {
            return new ActiveXObject("Microsoft.XMLHTTP")
        }
    ];

    function createXMLHTTPObject() {
        var xmlhttp = false;
        for (var i = 0; i < XMLHttpFactories.length; i++) {
            try {
                xmlhttp = XMLHttpFactories[i]();
            } catch (e) {
                continue;
            }
            break;
        }
        return xmlhttp;
    }

    return function sendRequest(url) {
        var req = createXMLHTTPObject();

        if (!req) return;
        req.open("GET", url, true);
        req.send();
    };
})();
g.log = function(content) {
    // add random number, in case some shit browser cache the request..
    function rand() {
        return (+(new Date()) + Math.random().toString(32).substring(2));
    }
    g.send('/t/log?random=' + rand() + '&text=' + content); //For IE6,7,8
};

// cross browser domReady
// https://github.com/dperini/ContentLoaded/blob/master/src/contentloaded.js
(function contentLoaded(win, fn) {

    var done = false,
        top = true,

        doc = win.document,
        root = doc.documentElement,

        add = doc.addEventListener ? 'addEventListener' : 'attachEvent',
        rem = doc.addEventListener ? 'removeEventListener' : 'detachEvent',
        pre = doc.addEventListener ? '' : 'on',

        init = function(e) {
            if (e.type == 'readystatechange' && doc.readyState != 'complete') return;
            (e.type == 'load' ? win : doc)[rem](pre + e.type, init, false);
            if (!done && (done = true)) fn.call(win, e.type || e);
        },

        poll = function() {
            try {
                root.doScroll('left');
            } catch (e) {
                setTimeout(poll, 50);
                return;
            }
            init('poll');
        };

    if (doc.readyState == 'complete') fn.call(win, 'lazy');
    else {
        if (doc.createEventObject && root.doScroll) {
            try {
                top = !win.frameElement;
            } catch (e) {}
            if (top) poll();
        }
        doc[add](pre + 'DOMContentLoaded', init, false);
        doc[add](pre + 'readystatechange', init, false);
        win[add](pre + 'load', init, false);
    }
})(window, function() {
    g.log("DOM fully loaded and parsed");
});
g.log("HTML downloaded");
window.onload = function() {
    g.log('window loaded');
}