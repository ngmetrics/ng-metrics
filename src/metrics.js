var Metrics = function($provide) {
  var metrics = this;
  window.m = this;

  this.orig = {};
  this.digests = {};

  this.decorateMap = {
    '$rootScope': {
      '$digest': function($orig, stack) {
        var digestId = metrics.MD5.hashStr( stack );
        var digest = metrics.getDigest(digestId, stack);

        // this refers to $scope
        this.$$ngMetricsDigestId = digestId;

        var start = Date.now();

        // Call original $digest()
        $orig.call(this);

        // Record max and avg duration for this digest
        var duration = Date.now() - start;

        if (duration > digest.max) {
          digest.max = duration;
        }

        digest.avg = (digest.avg * digest.cycles + duration) / (digest.cycles + 1);
        digest.cycles++;
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
              // Store stack trace for hash generation and metrics
              var stack = (new Error()).stack;

              if (metrics.enabled) {
                var args = Array.prototype.slice.call(arguments);

                // Pass original function and stack trace to the decorator
                args.unshift(orig, stack);

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

Metrics.prototype.enabled = false;
Metrics.prototype.cookieName = '__ngmguid';

Metrics.prototype.getDigest = function(id, stack) {
  var digest = this.digests[id];

  if (! digest) {
    digest = this.digests[id] = new this.Digest(id);
    digest.stack = stack;
  }

  return digest;
};

Metrics.prototype.init = function() {
};

Metrics.prototype.enable = function() {
  this.enabled = true;
};

Metrics.prototype.disable = function() {
  this.enabled = false;
};

Metrics.prototype.getGuid = function() {
  if (this.docCookies.hasItem(this.cookieName)) {
    return this.docCookies.getItem(this.cookieName);
  }

  var guid = this.generateGuid();
  this.docCookies.setItem(this.cookieName, guid, Infinity, '/');

  return guid;
};

Metrics.prototype.generateGuid = function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
};

Metrics.prototype.$get = ['$parse', '$rootScope', '$route', function($parse, $rootScope, $route) {
  this.$parse = $parse;
  this.$rootScope = $rootScope;
  this.$route = $route;

  this.init();

  return this;
}];

Metrics.prototype.docCookies = docCookies;
Metrics.prototype.Digest = Digest;
Metrics.prototype.MD5 = MD5;

// vim: shiftwidth=2
