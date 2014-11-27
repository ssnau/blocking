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
     * if there is a {{complex}} tag in the document,
     * it will wrap a complex log function which will
     * send ajax log to the server. It is useful for
     * latency browsers.
     *
     * @param {[type]} source html document
     */
    addJsPartial: function(source) {
        var setupScript = "";
        if (source.indexOf('{{complex}}')) {
          setupScript = fs.readFileSync('partial/setup.js');
        } else {
          setupScript = fs.readFileSync('partial/setup-light.js');
          source = source.replace("{{complex}}", "");
        }

        partial = "<script>\n" + setupScript + "\n</script>";
        return source.replace("<head>", "<head>\n" + partial);
    },
    /**
     * support {{flush x}} statement in the document.
     * the "x" means the server will idle for x ms before
     * it continue writing content to the client.
     * @param {string} source
     * @param {HttpResponse} res
     *
     */
    handleFlushEarly: function(source, res) {
      var REG = /\{\{\s*flush\s+(\d+)\}\}/;
      var REG_G = /\{\{\s*flush\s+\d+\}\}/g;

      var parts = source.split(/\{\{\s*flush\s+\d+\}\}/); 
      var delays = source.match(REG_G).map(function(m) {
        return m.match(REG)[1] - 0;
      });
      // delay 200ms for the first part
      delays.unshift(200);

      // compose
      parts = parts.map(function(part, index) {
        return {
          content: part,
          delay: delays[index]
        };
      });

      require('async').eachSeries(parts, function(part, next) {
        setTimeout(function(){
          res.write(part.content);
          next();
        }, part.delay);
      }, function finish(err) {
        res.end(); 
      });
    }
}
