var module = angular.module('ngMetrics', []);

module.provider('ngMetrics', ['$provide', function($provide) {
  return new Metrics($provide);
}]);
// vim: shiftwidth=2
