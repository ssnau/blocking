var fs = require('fs');



module.exports = {
    /**
     * add version number for each `src`|`href` so that browser won't hit cache when perform requesting
     * @param  {string} source  html document
     * @param  {string} version any random string
     * @return {string}
     */
    versionize: function(source, version) {
        // add version after all scr, href
        return source.replace(/(src|href)=["'](.+?)["']/g, function(all, m1, m2) {
            var c = /[?]/.test(all) ? "&" : "?";
            var v = version || Date.now();
            return ret = m1 + '="' + m2 + c + "v=" + v + '"';
        });
    },
    /**
     * add js partial for the document.
     * The Js Partial is used for:
     * 1. cross browser xhr request
     * 2. cross browser dom ready event
     * 3. cross browser logging system
     *
     * @param {[type]} source html document
     */
    addJsPartial: function(source) {
        var setupScript = fs.readFileSync('partial/setup.js');

        partial = "<script>\n" + setupScript + "\n</script>";
        return source.replace("<head>", "<head>\n" + partial);
    }
}