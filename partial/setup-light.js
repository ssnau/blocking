var g = {};
g.now = Date.now || function now() {
    return new Date().getTime();
};
g.start = g.now();
g.log = function (content) {
    var spent = g.now() - g.start;
    if (typeof console !== 'undefined') {
      console.log('[' + spent + 'ms]' + content);
    }
}
