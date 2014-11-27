var g = {};
g.now = Date.now || function now() {
    return new Date().getTime();
};
g.start = $start; // timestamp from server
g.log = function (content) {
    // add random number, in case some shit browser cache the request..
    function rand() {
        return (+(new Date()) + Math.random().toString(32).substring(2));
    }
    var spent = g.now() - g.start;
    // Browser limit the number of http request, if we are sending a request
    // to server while reaching the maxinum nubmer, the request would be 
    // live in a Queue. In this case, the time span computed by server will
    // be unreliable, and we must calculate it in client side instead.
  if (typeof console !== 'undefined') {
    console.log('[' + spent + 'ms]' + content);
  }
}
