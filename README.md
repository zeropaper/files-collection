# FilesCollection

A [Ampersand.js](http://ampersandjs.com) set of classes to provide tools
to browse and manage files and directories (existing or not).

Originally written for [grunt-gtfd](http://github.com/zeropaper/grunt-gtfd),
a [grunt.js](http://gruntjs.com) task to generate project wide documentation.

## Usage

```js
var FilesCollection = require('files-collection');

var filesCollection = new FilesCollection([
  { filepath: 'index.js' },
  { filepath: 'fictive/filepath/scripts.js' },
  { filepath: 'fictive/filepath/styles.less' },
  { filepath: 'fictive/index.js' },
  { filepath: 'fictive/other-filepath/index' },
  { filepath: 'fictive/other-filepath/styles.less' }
]);

var autogeneratedDirectory = filesCollection.get('fictive');
autogeneratedDirectory.dirname          // ==> '.'
autogeneratedDirectory.basename         // ==> 'fictive'
autogeneratedDirectory.isDir            // ==> true
autogeneratedDirectory.isRootDir        // ==> false
autogeneratedDirectory.files            // ==> a collection with the files and directories

var scriptFile = filesCollection.get('fictive/filepath/scripts.js');
scriptFile.dirname                      // ==> 'fictive/filepath'
scriptFile.basename                     // ==> 'scripts.js'
scriptFile.isDir                        // ==> false
scriptFile.relative('fictive/index.js') // ==> '../index.js'
```

## Documentation

Can be generated using npm `run-script docs` and will be written in `DOCUMENTATION.md`.

## Test

Can be runned usin `npm test`.

## Author

Valentin Vago [@zeropaper](http://twitter.com/zeropaper) valentin.vago@gmail.com

## License

[MIT](./LICENSE)
