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

var BrowserModel = BrowserCollection.prototype.model;
var FileModel = BrowserModel.extend({
  props: {
    content: 'string'
  },


  derived: {
    absolutePath: {
      deps: ['filepath'],
      cache: false,
      fn: function () {
        return this.collection.cwd ?
                path.join(this.collection.cwd, this.filepath) :
                this.filepath;
      }
    },

    exists: {
      deps: ['filepath'],
      cache: false,
      fn: function () {
        return fs.existsSync(this.absolutePath);
      }
    },

    isDir: {
      deps: ['filepath'],
      cache: false,
      fn: function () {
        return this.exists ? fs.statSync(this.absolutePath).isDirectory() : false;
      }
    },

    isFile: {
      deps: ['filepath'],
      cache: false,
      fn: function () {
        return this.exists ? fs.statSync(this.absolutePath).isFile() : false;
      }
    }
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
    var source = options.source || path.join((options.cwd || model.collection.cwd || ''), model.filepath);

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
  },


  initialize: function () {
    BrowserModel.prototype.initialize.apply(this, arguments);
    if (this.exists && this.isFile) {
      this.fetch();
    }
  }
});






module.exports = BrowserCollection.extend({
  model: FileModel,

  cwd: '',

  initialize: function (attributes, options) {
    this.cwd = options.cwd || '';

    BrowserCollection.prototype.initialize.apply(this, arguments);
  }
});
