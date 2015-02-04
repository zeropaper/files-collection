// # MyModule
// Description of the module
// and that kind of stuff.
// _Sometimes_ formated too.
// @require ampersand-state AmpersandState
// @require ./filepath/scripts OtherModule

// ## Some
// @property {Constructor} Some
// @extend {AmpersandState}
// @static
// @param {Object} [attributes] the property values of the state
// @param {Object} [options] some initialization options
var SomeClass = require('ampersand-state').extend({
  props: {
    someVal: 'string'
  },

  derivate: {
    firstLetter: {
      deps: 'someVal',
      fn: function () {
        return (this.someVal || '')[0];
      }
    }
  }
});


// @
module.exports = {
  Some: SomeClass
};
