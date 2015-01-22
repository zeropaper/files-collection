/* jshint node: true, browser: false */
'use strict';
var fs = require('fs');
var path = require('path');
var BrowserCollection = require('./index');


function noop() {}


function isSync(options) {
  return !options.success && !options.error && !options.complete;
}


function makeCallback(options) {
  if (options.complete) {
    return options.complete;
  }

  var success = options.success || noop;
  var error = options.error || noop;

  return function (err) {
    if (err) {
      return error(err);
    }
    success();
  };
}


var FileModel = BrowserCollection.prototype.model.extend({
  props: {
    content: 'string'
  },

  save: function (attributes, options) {
    options = options || {};
    var model = this;
    var destination = options.destination || model.filepath;

    if (isSync(options)) {
      if (model.isDir) {
        return model;
      }
      return fs.writeFileSync(destination, model.content, options);
    }

    if (!model.isDir) {
      fs.writeFile(destination, model.content, options, makeCallback(options));
    }
    return model;
  },


  fetch: function (options) {
    options = options || {};
    var model = this;
    var source = options.source || path.join(options.cwd || model.collection.cwd, model.filepath);

    if (isSync(options)) {
      if (model.isDir) {
        /*
        throw new Error('directory fetching not yet supported');
        */
        return model;
      }
      model.content = fs.readFileSync(source, options).toString();
      return model;
    }

    function cb(err, content) {
      if (!err) {
        model.content = content.toString();
      }

      makeCallback(options).apply(model, arguments);
    }

    if (!model.isDir) {
      fs.readFile(source, options, cb);
    }
    else {
      cb(new Error('directory fetching not yet supported'));
    }
  }
});


module.exports = BrowserCollection.extend({
  model: FileModel
});
