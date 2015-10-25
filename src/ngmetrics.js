var processedDirectives = [];
var directivesQueue = [];

var module = angular.module('ngMetrics', []);

module.provider('ngMetrics', ['$provide', function($provide) {
  return new Metrics($provide, directivesQueue);
}]);

// Patching angular module/directive method to intercept directives
// creation.
var origModule = angular.module;

angular.module = function(name, deps) {
  var mod = origModule.apply(angular, arguments);

  if (! deps) {
    return mod;
  }

  var origDirective = mod.directive;

  mod.directive = function(dirName) {
    var ngdir = origDirective.apply(mod, arguments);

    if (processedDirectives.indexOf(dirName) > -1) {
      return ngdir;
    }

    processedDirectives.push(dirName);

    directivesQueue.push({
      module  : mod,
      dirName : dirName
    });

    return ngdir;
  };

  return mod;
};
// End of patching module/directives

// vim: shiftwidth=2
