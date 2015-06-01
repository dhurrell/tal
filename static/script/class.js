/* Surpression of JSHint 'Don't make functions within a loop'*/
/* jshint -W083 */
/**
 * @fileOverview Requirejs module containing antie.Class top-level base class.
 *
 * Inspired by base2 and Prototype
 * @see http://ejohn.org/blog/simple-javascript-inheritance/
 *
 * @author John Resig <eresig@gmail.com>
 */

require.def('antie/class', function() {
  "use strict";
  var initializing = false;

	/**
	 * The base Class implementation (does nothing)
	 * @name antie.Class
	 * @class
	 * @abstract
	 */
  function Class(){}

	/**
	 * Create a new Class that inherits from this class
	 * @name extend
	 * @memberOf antie.Class
	 * @function
	 * @static
	 * @param {Object} prop Prototype to add to the new extended class.
	 */
	Class.extend = function(prop) {
        var _super = this.prototype;

		// Instantiate a base class (but only create the instance,
		// don't run the init constructor)
		initializing = true;
		var proto = new this();
		initializing = false;

        // Copy the properties over onto the new prototype
        for (var name in prop) {
            proto[name] = prop[name];
            if (typeof prop[name] === 'function') {
                proto[name].base = _super[name];
            }
        }

		// The dummy class constructor
		var newClass = function() {
			// All construction is actually done in the init method
			if ( !initializing && this.init )
				this.init.apply(this, arguments);
		};

        // Populate our constructed prototype object
        newClass.prototype = proto;
    
        // Enforce the constructor to be what we expect
        proto.constructor = newClass;
    
        // And make this class extendable
        newClass.extend = Class.extend;

        return newClass;
      };

      return Class;
});
