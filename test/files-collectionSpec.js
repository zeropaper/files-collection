'use strict';
/* jshint node: true, browser: true */
/* global require: false, describe: false, xdescribe: false, it: false */
var expect = require('expect.js');

function err(label) {
  return function (err) {
    console.info(label, err.stack);
  };
}

describe('FilesCollection', function () {
  var FilesCollection;

  it('loads', function () {
    expect(function () {
      FilesCollection = require('./../index');
    }).not.to.throwError(err('loading FilesCollection'));
  });


  describe('Directory collection', function () {
    var filesCollection;

    it('instanciate', function () {
      expect(function () {
        filesCollection = new FilesCollection(FilesCollection.expand([
          'index.js.html',
          'fictive/filepath/scripts.js.html',
          'fictive/filepath/styles.less.html',
          'fictive/index.js.html',
          'fictive/other-filepath/index.html',
          'fictive/other-filepath/styles.less.html'
        ]), {
          active: 'fictive/filepath/scripts.js.html'
        });
      }).not.to.throwError(err('instanciate'));
    });


    describe('directories()', function () {
      it('can be used to find the directories', function () {
        var list = filesCollection.directories();

        expect(list).to.be.an('array');
        expect(list.length).to.be(4);
      });
    });


    describe('tree()', function () {
      it('returns a tree like structure', function () {
        var tree;
        expect(function () {
          tree = filesCollection.tree();
        }).not.to.throwError(err('tree'));

        expect(tree).to.be.an('object');

        expect(tree.filepath).to.be('.');

        expect(tree.files.length).to.be(2);
        expect(tree.files.at(0)).to.be.a(FilesCollection.File);
      });
    });


    describe('tree(filepath)', function () {
      it('returns a tree like structure starting at a given filepath', function () {
        var tree;
        expect(function () {
          tree = filesCollection.tree('fictive');
        }).not.to.throwError(err('tree'));

        expect(tree).to.be.an('object');

        expect(tree.filepath).to.be('fictive');

        expect(tree.files.length).to.be(3);
        expect(tree.files.filter(function (file) {
          return file.basename === 'index.js';
        }).length).to.be(1);
      });
    });
  });


  describe('File model', function () {
    var fileModelA;
    var fileModelB;

    it('instanciate', function () {
      expect(function () {
        fileModelA = new FilesCollection.File({
          filepath: 'index.html'
        });

        fileModelB = new FilesCollection.File({
          filepath: 'fictive/filepath/styles.less.html'
        });
      }).not.to.throwError(err('model initialization'));
    });


    describe('relative()', function () {
      it('returns the path to the project directory', function () {
        expect(fileModelA.relative()).to.be('');
        expect(fileModelB.relative()).to.be('../..');
      });
    });


    describe('relative(filepath)', function () {
      it('returns the relative path to filepath', function () {
        expect(fileModelA.relative('fictive/filepath/styles.less.html')).to.be('fictive/filepath/styles.less.html');
        expect(fileModelA.relative('fictive/filepath')).to.be('fictive/filepath');

        expect(fileModelB.relative('fictive/filepath')).to.be('');
        expect(fileModelB.relative('fictive')).to.be('..');
        expect(fileModelB.relative('')).to.be('../..');
        expect(fileModelB.relative('index.html')).to.be('../../index.html');
      });
    });


    describe('relative(model)', function () {
      it('returns the relative path to model', function () {
        expect(fileModelA.relative(fileModelB)).to.be('fictive/filepath/styles.less.html');

        expect(fileModelB.relative(fileModelA)).to.be('../../index.html');
      });
    });
  });
});
