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
  var expand;

  it('loads', function () {
    expect(function () {
      FilesCollection = require('./../index');
      expand = FilesCollection.expand;
    }).not.to.throwError(err('loading FilesCollection'));
  });


  describe('Directory collection', function () {
    var filesCollection;

    it('instanciate', function () {
      expect(function () {
        filesCollection = new FilesCollection(expand([
          'README.md',
          'index.js',
          'fictive/filepath/scripts.js',
          'fictive/filepath/styles.less',
          'fictive/file.js',
          'fictive/other-filepath/index',
          'fictive/other-filepath/styles.less'
        ]), {
          active: 'fictive/filepath/scripts.js'
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

        expect(tree.files.length).to.be(3);
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
          return file.basename === 'file.js';
        }).length).to.be(1);
      });
    });


    describe('index()', function () {
      it('returns the README.md by default', function () {
        var index;
        expect(function () {
          index = filesCollection.index();
        }).not.to.throwError(err('index'));

        expect(index.filepath).to.be('README.md');
      });
    });


    describe('index(basenames)', function () {
      var filesCollection;

      before(function () {
        filesCollection = new FilesCollection(expand([
          'README.md',
          'file.txt',
          'scripts.js'
        ]));
      });

      it('returns the first found in the array', function () {
        expect(filesCollection.index([
          'not-extisting.pdf',
          'file.txt',
          'README.md'
        ]).filepath).to.be('file.txt');
      });
    });
  });


  describe('File model', function () {
    var filesCollection;

    function get(str) {
      return filesCollection.get(str);
    }

    it('instanciate', function () {
      expect(function () {
        filesCollection = new FilesCollection(expand([
          'README.md',
          'index',
          // the fictive directory has no "index" (README.md)
          'fictive/file.js',
          //
          'fictive/filepath/scripts.js',
          'fictive/filepath/styles.less',
          // the fictive/other-filepath directory has an "index" (README.md!)
          'fictive/other-filepath/README.md',
          // this file is not considered as the "index"
          'fictive/other-filepath/index',
          'fictive/other-filepath/styles.less'
        ]), {
          active: 'fictive/filepath/scripts.js'
        });
      }).not.to.throwError(err('model initialization'));
    });


    describe('index()', function () {
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



    describe('isIndex', function () {
      it('is true when the file is considered as "index" of its directory', function () {
        expect(get('README.md').isIndex).to.be(true);
        expect(get('fictive/other-filepath/README.md').isIndex).to.be(true);
      });

      it('is false otherwise', function () {
        expect(get('index').isIndex).to.be(false);
        expect(get('fictive/filepath/scripts.js').isIndex).to.be(false);
        expect(get('fictive/other-filepath/index').isIndex).to.be(false);
      });
    });


    describe('relative()', function () {
      describe('for the "index" model', function () {
        it ('resturns "" (empty string)', function () {
          expect(get('index').relative()).to.be('');
        });
      });


      describe('for the "fictive/filepath/styles.less" model', function () {
        it ('resturns "../.."', function () {
          expect(get('fictive/filepath/styles.less').relative()).to.be('../..');
        });
      });
    });


    describe('relative(filepath)', function () {
      describe('for the "index" model', function () {
        describe('to "fictive/filepath/styles.less"', function () {
          it('returns "fictive/filepath/styles.less"', function () {
            expect(get('index').relative('fictive/filepath/styles.less')).to.be('fictive/filepath/styles.less');
          });
        });
      });


      describe('for the "index" model', function () {
        describe('to "fictive/filepath/styles.less"', function () {
          it('returns "fictive/filepath/styles.less"', function () {
            expect(get('index').relative('fictive/filepath')).to.be('fictive/filepath');
          });
        });
      });


      describe('for the "fictive/filepath/styles.less" model', function () {
        describe('to "fictive/filepath"', function () {
          it('returns "', function () {
            expect(get('fictive/filepath/styles.less').relative('fictive/filepath')).to.be('');
          });
        });
      });


      describe('for the "fictive/filepath/styles.less" model', function () {
        describe('to "fictive"', function () {
          it('returns ".."', function () {
            expect(get('fictive/filepath/styles.less').relative('fictive')).to.be('..');
          });
        });
      });


      describe('for the "fictive/filepath/styles.less" model', function () {
        describe('to ""', function () {
          it('returns "../.."', function () {
            expect(get('fictive/filepath/styles.less').relative('')).to.be('../..');
          });
        });
      });


      describe('for the "fictive/filepath/styles.less" model', function () {
        describe('to the "index"', function () {
          it('returns "../../index"', function () {
            expect(get('fictive/filepath/styles.less').relative('index')).to.be('../../index');
          });
        });
      });
    });


    describe('relative(model)', function () {
      describe('for the "index" model', function () {
        describe('to "fictive/filepath/styles.less" model', function () {
          it('returns "fictive/filepath/styles.less"', function () {
            expect(get('index').relative(get('fictive/filepath/styles.less'))).to.be('fictive/filepath/styles.less');
          });
        });
      });


      describe('for the "index" model', function () {
        describe('to "fictive/filepath/styles.less" model', function () {
          it('returns "fictive/filepath/styles.less"', function () {
            expect(get('index').relative(get('fictive/filepath'))).to.be('fictive/filepath');
          });
        });
      });


      describe('for the "fictive/filepath/styles.less" model', function () {
        describe('to "fictive/filepath" model', function () {
          it('returns "', function () {
            expect(get('fictive/filepath/styles.less').relative(get('fictive/filepath'))).to.be('');
          });
        });
      });


      describe('for the "fictive/filepath/styles.less" model', function () {
        describe('to "fictive" model', function () {
          it('returns ".."', function () {
            expect(get('fictive/filepath/styles.less').relative(get('fictive'))).to.be('..');
          });
        });
      });


      describe('for the "fictive/filepath/styles.less" model', function () {
        describe('to "" model', function () {
          it('returns "../.."', function () {
            expect(get('fictive/filepath/styles.less').relative(get(''))).to.be('../..');
          });
        });
      });


      describe('for the "fictive/filepath/styles.less" model', function () {
        describe('to "index" model', function () {
          it('returns "../../index"', function () {
            expect(get('fictive/filepath/styles.less').relative(get('index'))).to.be('../../index');
          });
        });
      });
    });



    describe('fileurl', function () {
      describe('when the active path is "fictive/filepath/scripts.js"', function () {
        describe('of "index"', function () {
          it('is "../../index"', function () {
            expect(get('index').fileurl)
              .to.be('../../index');
          });
        });


        describe('of "fictive/file.js" file', function () {
          it('is "../file.js"', function () {
            expect(get('fictive/file.js').fileurl)
              .to.be('../file.js');
          });
        });


        describe('of "README.md" index file', function () {
          it('is "../../index"', function () {
            expect(get('README.md').fileurl)
              .to.be('../../index');
          });
        });


        describe('of "fictive/other-filepath/README.md" index file', function () {
          it('is "../other-filepath/index"', function () {
            expect(get('fictive/other-filepath/README.md').fileurl)
              .to.be('../other-filepath/index');
          });
        });


        describe('of "fictive" directory which has no index', function () {
          it('is ".."', function () {
            // fictive has no index... edge case.. not cool
            expect(get('fictive').fileurl)
              .to.be('..');
          });
        });


        describe('of "fictive/other-filepath" directory which has a index', function () {
          it('is "../other-filepath/index"', function () {
            expect(get('fictive/other-filepath').fileurl)
              .to.be('../other-filepath/index');
          });
        });
      });


      describe('when the active path is "README.md"', function () {
        before(function () {
          filesCollection.setActive('README.md');
        });

        after(function () {
          filesCollection.setActive('fictive/filepath/scripts.js');
        });


        describe('of "index"', function () {
          it('is "index"', function () {
            expect(get('index').fileurl)
              .to.be('index');
          });
        });


        describe('of "fictive/file.js" file', function () {
          it('is "fictive/file.js" file', function () {
            expect(get('fictive/file.js').fileurl)
              .to.be('fictive/file.js');
          });
        });


        describe('of "README.md" index file', function () {
          it('is "index"', function () {
            expect(get('README.md').fileurl)
              .to.be('index');
          });
        });


        describe('of "fictive/other-filepath/README.md" index file', function () {
          it('is "fictive/other-filepath/index"', function () {
            expect(get('fictive/other-filepath/README.md').fileurl)
              .to.be('fictive/other-filepath/index');
          });
        });


        describe('of "fictive" directory which has no index', function () {
          it('is "fictive"', function () {
            // fictive has no index... edge case.. not cool
            expect(get('fictive').fileurl)
              .to.be('fictive');
          });
        });


        describe('of "fictive/other-filepath" directory which has a index', function () {
          it('is "fictive/other-filepath/index"', function () {
            expect(get('fictive/other-filepath').fileurl)
              .to.be('fictive/other-filepath/index');
          });
        });
      });


      describe('when the active path is "fictive/other-filepath"', function () {
        before(function () {
          filesCollection.setActive('fictive/other-filepath');
        });

        after(function () {
          filesCollection.setActive('fictive/filepath/scripts.js');
        });


        describe('of "index"', function () {
          it('is "../../index"', function () {
            expect(get('index').fileurl)
              .to.be('../../index');
          });
        });


        describe('of "fictive/file.js" file', function () {
          it('is "../file.js"', function () {
            expect(get('fictive/file.js').fileurl)
              .to.be('../file.js');
          });
        });


        describe('of "README.md" index file', function () {
          it('is "../../index"', function () {
            expect(get('README.md').fileurl)
              .to.be('../../index');
          });
        });


        describe('of "fictive/other-filepath/README.md" index file', function () {
          it('is "index"', function () {
            expect(get('fictive/other-filepath/README.md').fileurl)
              .to.be('index');
          });
        });


        describe('of "fictive" directory which has no index', function () {
          it('is ".."', function () {
            // fictive has no index... edge case.. not cool
            expect(get('fictive').fileurl)
              .to.be('..');
          });
        });


        describe('of "fictive/other-filepath" directory which has a index', function () {
          it('is "index"', function () {
            expect(get('fictive/other-filepath').fileurl)
              .to.be('index');
          });
        });
      });


      describe('when the active path is "fictive/other-filepath/README.md"', function () {
        before(function () {
          filesCollection.setActive('fictive/other-filepath/README.md');
        });

        after(function () {
          filesCollection.setActive('fictive/filepath/scripts.js');
        });


        describe('of "index"', function () {
          it('is "../../index"', function () {
            expect(get('index').fileurl)
              .to.be('../../index');
          });
        });


        describe('of "fictive/file.js" file', function () {
          it('is "../file.js"', function () {
            expect(get('fictive/file.js').fileurl)
              .to.be('../file.js');
          });
        });


        describe('of "README.md" index file', function () {
          it('is "../../index"', function () {
            expect(get('README.md').fileurl)
              .to.be('../../index');
          });
        });


        describe('of "fictive/other-filepath/README.md" index file', function () {
          it('is "index"', function () {
            expect(get('fictive/other-filepath/README.md').fileurl)
              .to.be('index');
          });
        });


        describe('of "fictive" directory which has no index', function () {
          it('is ".."', function () {
            // fictive has no index... edge case.. not cool
            expect(get('fictive').fileurl)
              .to.be('..');
          });
        });


        describe('of "fictive/other-filepath" directory which has a index', function () {
          it('is "index"', function () {
            expect(get('fictive/other-filepath').fileurl)
              .to.be('index');
          });
        });
      });
    });
  });
});
