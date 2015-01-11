'use strict';
/* jshint node: true, browser: true */
/* global require: false */
var path = require('path');

var Collection = require('ampersand-collection');
var Model = require('ampersand-model');







// ##### internal extname
function extname(str) {
  return path.extname(path.basename(str, '.html'));
}

// ##### internal toProject
function toProject(str) {
  return str.split('/').length > 1 ? path.dirname(str).replace(/([^\/]+)/gi, '..') : '';
}

var FileModel;

var DirectoryCollection = Collection.extend({
  mainIndex: 'filepath',
  idAttribute: 'filepath',

  indexes: [
    'basename'
  ],

  comparator: function (a, b) {
    if (a.isDir !== b.isDir) {
      if (a.isDir) { return true; }
      if (b.isDir) { return false; }
    }
    return a.basename > b.basename;
  },

  model: FileModel
});

FileModel = Model.extend({
  idAttribute: 'filepath',

  props: {
    filepath: ['string', true]
  },

  collections: {
    files: DirectoryCollection
  },

  derived: {
    isFile: {
      cache: false,
      fn: function () {
        return this.files.length < 1;
      }
    },

    isDir: {
      cache: false,
      fn: function () {
        return this.files.length > 0;
      }
    },

    isRootDir: {
      deps: ['filepath'],
      fn: function () {
        return [
          '',
          '.',
          './'
        ].indexOf(this.filepath) > -1;
      }
    },

    trail: {
      cache: false,
      fn: function () {
        return this.isDir &&
          this.collection.active.indexOf(this.filepath) === 0;
      }
    },

    dirname: {
      deps: ['filepath'],
      fn: function () {
        return path.dirname(this.filepath);
      }
    },

    toProjectDir: {
      deps: ['filepath'],
      fn: function () {
        return toProject(this.filepath);
      }
    },

    basename: {
      deps: ['filepath'],
      fn: function () {
        return path.basename(this.filepath, '.html');
      }
    },

    extname: {
      deps: ['filepath'],
      fn: function () {
        return extname(this.filepath);
      }
    },

    fileurl: {
      deps: ['filepath'],
      cache: false,
      fn: function () {
        return path.relative(path.dirname(this.collection.active), this.filepath);
      }
    },

    active: {
      deps: ['filepath'],
      cache: false,
      fn: function () {
        return this.collection.active === this.filepath;
      }
    }
  },

  serialize: function () {
    var res = this.getAttributes({ props: true }, true);

    Object.keys(this._children).forEach(function (key) {
      res[key] = this[key].serialize();
    }, this);

    [
      'active'
    ].forEach(function (key) {
      if (this[key]) {
        res[key] = true;
      }
    }, this);

    Object.keys(this._collections).forEach(function (key) {
      res[key] = this[key].serialize();
    }, this);
    return res;
  },

  initialize: function () {
    var parents = [];

    if (!this.isRootDir) {
      var parentPath = this.dirname;
      var parentModel = this.collection ? this.collection.get(parentPath) : false;

      parents = this.dirname.split('/');

      if (this.collection && !parentModel) {
        this.collection.add({
          filepath: parentPath,
          files: [this]
        });
      }
      else if (parentModel) {
        parentModel.files.add(this);
      }
    }


    if (!this.collection) {
      return;
    }

    var dirpath = this.dirname + '/' + this.basename;

    this.files.add(this.collection.filter(function (model) {
      return model.dirname === dirpath;
    }));

    this.listenTo(this.collection, 'add', function (model) {
      if (model.dirname === dirpath) {
        this.files.add(model);
      }
    });

    this.listenTo(this.collection, 'remove', function (model) {
      if (model.dirname === dirpath) {
        this.files.remove(model);
      }
    });
  },

  resolve: function (obj) {
    var destination;
    if (typeof obj === 'string') {
      destination = obj;
    }
    else if (obj instanceof FileModel) {
      destination = obj.filepath;
    }

    return typeof destination === 'string' ?
            path.resolve(this.dirname, destination) :
            this.toProjectDir;
  },

  relative: function (obj) {
    var destination;
    if (typeof obj === 'string') {
      destination = obj;
    }
    else if (obj instanceof FileModel) {
      destination = obj.filepath;
    }

    return typeof destination === 'string' ?
            path.relative(this.dirname, destination) :
            this.toProjectDir;
  },

  inDir: function (dirname) {
    if (dirname === this.dirname) {
      return true;
    }
    return this.dirname.indexOf(dirname) === 0;
  }
});

var FilesCollection = module.exports = Collection.extend({
  model: FileModel,

  mainIndex: 'filepath',

  indexes: [
    'dirname',
    'extname'
  ],

  active: '',

  basePath: '',


  initialize: function (models, options) {
    options = options || {};

    if (!this.active && options.active) {
      this.active = options.active;
    }

    if (!this.basePath && options.basePath) {
      this.basePath = options.basePath;
    }
  },


  serialize: function () {
    var results = Collection.prototype.serialize.apply(this, arguments);
    return results.filter(function (model) {
      return !!model;
    });
  },


  comparator: function (a, b) {
    if (a.isDir !== b.isDir) {
      if (a.isDir) { return true; }
      if (b.isDir) { return false; }
    }
    return a.basename > b.basename;
  },


  filterBy: function (key, value, options) {
    var picked = [];
    options = options || {};

    function filter(model) {
      if (model[key] !== value) {
        return false;
      }

      picked.push(model.getId());
      return true;
    }

    var filtered = this.filter(filter);

    if (options.picked) {
      return picked;
    }

    return filtered;
  },


  filepaths: function (options) {
    options = options || {};
    var files = this
      .filter(function (model) {
        return model.isFile &&
          (options.dirname ? model.dirname === options.dirname : true);
      })
      .map(function (model) {
        return model.filepath;
      })
      .sort()
    ;
    return files;
  },


  directories: function () {
    var result = [];
    this.forEach(function (model) {
      if (result.indexOf(model.dirname) < 0) {
        result.push(model.dirname);
      }
    });
    return result;
  },


  tree: function (from) {
    from = from || '.';

    var dirModel = this.get(from);
    if (dirModel) {
      return dirModel;
    }

    return {
      filepath: from,
      files:    this.filter(function (model) {
                  return model.dirname === from;
                })
    };
  },


  setActive: function (active) {
    if (arguments.length && active !== this.active) {
      this.active = active || '';
      this.trigger('active', active, this);
    }
  }
});


FilesCollection.File = FileModel;

FilesCollection.Directory = DirectoryCollection;
