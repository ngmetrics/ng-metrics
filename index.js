(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else {
        factory();
    }
}(function() {

  var Metrics = function() {
  };

  var module = angular.module('ng-metrics', []);

  module.provider('ngMetrics', ['$provide', function($provide) {
    'use strict';
  }]);

  return Metrics;
}));
