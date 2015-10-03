/* eslint no-empty:0 */

var Route = function($injector, pathGetter) {
  this.$injector = $injector;

  if (pathGetter) {
    this.getCurrentPath = pathGetter;
  }
  else {
    this.detectMethod();
  }
};

Route.prototype.getCurrentUrl = Route.prototype.getCurrentPath = function() {
  return [
    window.location.pathname,
    window.location.search,
    window.location.hash
  ].join('');
};

Route.prototype.detectMethod = function() {
  var found = false;

  // try ui.router second
  try {
    var $state = this.$injector.get('$state');

    this.getCurrentPath = function() {
      return $state.$current && $state.$current.url.source;
    };

    found = true;
  } catch (e) {}

  if (found) { return; }

  // try ngRouter first
  try {
    var $route = this.$injector.get('$route');

    this.getCurrentPath = function() {
      return $route.current && $route.current.$$route.originalPath;
    };
  } catch (e) {}
};


// vim: shiftwidth=2
