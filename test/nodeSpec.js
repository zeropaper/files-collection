'use strict';
/* jshint node: true, browser: true, unused: false */
/* global require: false, describe: false, xdescribe: false, it: false */
var expect = require('expect.js');
var path = require('path');


function err(label) {
  return function (err) {
    console.info(label, err.stack);
  };
}

describe('FilesCollection for node.js', function () {
  var testExampleDir = path.join(__dirname, 'example');
  var FilesCollection;
  var expand;
  var filesCollection;

  function get(str) {
    return filesCollection.get(str);
  }

  it('loads', function () {
    expect(function () {
      FilesCollection = require('./../node');
      expand = FilesCollection.expand;
    }).not.to.throwError(err('loading FilesCollection'));
  });

  it('instanciate', function () {
    expect(function () {
      filesCollection = new FilesCollection(expand([
        'README.md',
        'index',
        // the fictive directory has no "index" (README.md)
        'fictive/file.js',
        // and some files do not exists
        'does-not-exists.md',
        'does-not-exists.js',
        //
        'fictive/filepath/scripts.js',
        'fictive/filepath/styles.less',
        // the fictive/other-filepath directory has an "index" (README.md!)
        'fictive/other-filepath/README.md',
        // this file is not considered as the "index"
        'fictive/other-filepath/index',
        'fictive/other-filepath/styles.less'
      ]), {
        cwd: testExampleDir,
        active: 'fictive/filepath/scripts.js'
      });
    }).not.to.throwError(err('model initialization'));
  });



  describe('index() function', function () {
    it('returns README.md model by default', function () {
      expect(get('README.md').isIndex).to.be(true);
      expect(filesCollection.index()).not.to.be(false);
    });


    it('returns "false" when not a directory', function () {
      expect(get('index').index()).to.be(false);
    });


    it('returns "false" when not found', function () {
      expect(get('fictive/filepath').index()).to.be(false);
    });
  });
  describe('exists derivate', function () {
    it('is true when present on filesystem', function () {
      expect(get('README.md').exists).to.be(true);
      expect(get('fictive/file.js').exists).to.be(true);
    });


    it('is false when not present on filesystem', function () {
      expect(get('does-not-exists.md').exists).to.be(false);
      expect(get('does-not-exists.js').exists).to.be(false);
    });
  });
});
