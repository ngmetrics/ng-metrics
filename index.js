(function(factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    factory();
  }
}(function() {

  var Metrics = function($provide) {
    var metrics = this;

    this.orig = {};
    this.enabled = false;

    this.decorateMap = {
      '$rootScope': {
        '$digest': function($orig) {
          var args = Array.prototype.slice.call(arguments);
          args.shift();
          $orig.call(this, args);
          console.log('$digest running');
        }
      }
    };

    for (var element in this.decorateMap) {
      if (this.decorateMap.hasOwnProperty(element)) {
        $provide.decorator(element, ['$delegate', function($delegate) {
          var $funcs = metrics.decorateMap[element];
          var proto = Object.getPrototypeOf($delegate);

          metrics.orig[element] = {};

          for (var $funcName in $funcs) {
            if ($funcs.hasOwnProperty($funcName)) {
              var orig = metrics.orig[element][$funcName] = proto[$funcName];

              // Replace original function with decorator
              proto[$funcName] = function() {
                if (metrics.enabled) {
                  var args = Array.prototype.slice.call(arguments);

                  // Pass original function to the decorator
                  args.unshift(orig);

                  $funcs[$funcName].apply(this, args);
                }
                else {
                  orig.apply(this, arguments);
                }
              };
            }
          }

          return $delegate;
        }]);
      }
    }
  };

  Metrics.prototype.enable = function() {
    this.enabled = true;
  };

  Metrics.prototype.disable = function() {
    this.enabled = false;
  };

  Metrics.prototype.$get = function() {
    return this;
  };

  var module = angular.module('ngMetrics', []);

  module.provider('ngMetrics', ['$provide', function($provide) {
    'use strict';
    return new Metrics($provide);
  }]);

  return Metrics;
}));
// vim: shiftwidth=2
