// Directive metrics
var Directive = function(directivesQueue) {
  this.directivesQueue = directivesQueue;

  this.directivesQueue.forEach(function(args) {
    this.decorateDirective(args);
  }.bind(this));

  this.directivesQueue.push = this.decorateDirective.bind(this);
  this.currentStats = [];
};

Directive.prototype.enabled = false;

Directive.prototype.enable = function() {
  this.enabled = true;
};

Directive.prototype.disable = function() {
  this.enabled = false;
};

Directive.prototype.decorateDirective = function(args) {
  var that = this;
  var mod = args.module, dirName = args.dirName;

  mod.config(['$provide', function($provide) {
    $provide.decorator(dirName + 'Directive', ['$delegate', function($delegate) {
      // patch compile results dynamically as well
      if ($delegate[0] && $delegate[0].compile) {
        var origCompile = $delegate[0].compile;

        $delegate[0].compile = function() {
          var compileResult = origCompile.apply($delegate[0], arguments);

          if (typeof compileResult === 'function') {
            var obj = {
              link: compileResult
            };
            that.patchFunction(obj, 'link', dirName);
            compileResult = obj.link;
          }
          else {
            that.patchFunction(compileResult, 'link', dirName);
            that.patchFunction(compileResult, 'pre', dirName);
            that.patchFunction(compileResult, 'post', dirName);
          }

          return compileResult;
        };
      }

      // Patch compile and link functions
      that.patchFunction($delegate[0], 'compile', dirName);
      that.patchFunction($delegate[0], 'link', dirName);

      return $delegate;
    }]);
  }]);
};

Directive.prototype.currentStats = [];

Directive.prototype.flush = function() {
  var current = this.currentStats;
  this.currentStats = [];
  return current;
};

Directive.prototype.addStat = function(dirName, funcName, el, dur) {
  this.currentStats.push({
    dn : dirName,          // directive name
    fn : funcName,         // function name
    el : Util.getPath(el), // element path
    du : dur               // duration
  });
};

Directive.prototype.patchFunction = function(obj, funcName, dirName) {
  var that = this;

  if (obj[funcName]) {
    var origFunc = obj[funcName];

    obj[funcName] = function($scope, el) {
      if (! that.enabled) {
        return origFunc.apply(obj, arguments);
      }

      // If patching 'compile' function, `el` is first parameter
      if (funcName === 'compile') {
        el = $scope;
        $scope = null;
      }

      var start = Util.perf();
      var result = origFunc.apply(obj, arguments);
      var dur = Util.perf() - start;

      that.addStat(dirName, funcName, el, dur);

      return result;
    };
  }
};
