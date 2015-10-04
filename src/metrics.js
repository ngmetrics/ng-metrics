/* eslint no-console:0 */

var Metrics = function($provide) {
  var metrics = this;
  window.m = this;

  this.orig = {};
  this.digests = {};
  this.routeStats = {};

  this.decorateMap = {
    '$rootScope': {
      '$digest': function($orig, stack) {
        var digestId = metrics.MD5.hashStr( stack );
        var digest = metrics.getDigest(digestId, stack);

        // this refers to $scope
        this.$$ngMetricsDigestId = digestId;

        // To prevent rs metrics settle before long digest finishes
        metrics.rsMetrics.cancelScheduledSettle();

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

        // Update responsiveness metrics
        metrics.rsMetrics.addDigestTime(duration, digestId);

        var routeStat = metrics.getCurrentRouteStat();

        if (routeStat.digests.indexOf(digestId) === -1) {
          routeStat.digests.push(digestId);
        }

        if (duration > routeStat.maxDigest) {
          routeStat.maxDigest = duration;
          routeStat.maxDigestId = digestId;
        }

        routeStat.totalDigest += duration;
      }
    }
  };

  // Bunch of code to patch Angular.js with metrics gathering hooks
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
Metrics.prototype.flushInterval = null;
Metrics.prototype.cookieName = '__ngmguid';
Metrics.prototype.metricsServer = 'app.ngmetrics.com';
Metrics.prototype.appId = null;

Metrics.prototype.getDigest = function(id, stack) {
  var digest = this.digests[id];

  if (! digest) {
    digest = this.digests[id] = new this.Digest(id);
    digest.stack = stack;
  }

  return digest;
};

Metrics.prototype.getCurrentRouteStat = function() {
  var currentPath = this.route.getCurrentPath() || '';

  if (! this.routeStats[currentPath]) {
    this.routeStats[currentPath] = {
      path        : currentPath,
      url         : this.route.getCurrentUrl(),
      digests     : [],
      maxDigest   : 0,
      maxDigestId : '',
      totalDigest : 0
    };
  }

  return this.routeStats[currentPath];
};

Metrics.prototype.getEndpointUrl = function() {
  return 'http://' + this.metricsServer + '/data/log?appId=' + this.appId + '&__c=' + Date.now();
};

Metrics.prototype.flushCollectedMetrics = function() {
  if (Object.keys(this.digests).length === 0) {
    return;
  }

  var data = {
    guid    : this.getGuid(),
    digests : [],
    routes  : [],
    rs      : this.rsMetrics.flush()
  };

  Object.keys(this.digests).forEach(function(key) {
    data.digests.push( this.digests[key] );
  }.bind(this));

  this.digests = {};

  Object.keys(this.routeStats).forEach(function(key) {
    data.routes.push( this.routeStats[key] );
  }.bind(this));

  this.routeStats = {};

  var dataStr = JSON.stringify(data);
  var xhr = this.getXhr();

  xhr.open('POST', this.getEndpointUrl(), true);
  xhr.setRequestHeader('Content-type', 'application/json');
  xhr.send(dataStr);
};

Metrics.prototype.getXhr = function() {
  if (! this.xhr) {
    this.xhr = new XMLHttpRequest();
  }

  return this.xhr;
};

Metrics.prototype.init = function(/*options*/) {
};

Metrics.prototype.enable = function() {
  if (this.appId == null) {
    console.warn('ngMetrics requires appId to be set before enabling');
    return;
  }

  this.flushInterval = setInterval(this.flushCollectedMetrics.bind(this), 60000);
  this.rsMetrics.attachEventListeners();
  this.enabled = true;
};

Metrics.prototype.disable = function() {
  if (this.flushInterval) {
    clearInterval(this.flushInterval);
    this.flushInterval = null;
  }

  this.rsMetrics.detachEventListeners();
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

Metrics.prototype.$get = [
  '$parse', '$injector', '$rootScope',
  function($parse, $injector, $rootScope) {
    // angular stuff
    this.$parse = $parse;
    this.$injector = $injector;
    this.$rootScope = $rootScope;

    // metrics stuff
    this.route = new Route(this.$injector);
    this.rsMetrics = new RS(this.route);

    return this;
  }
];

Metrics.prototype.docCookies = docCookies;
Metrics.prototype.Digest = Digest;
Metrics.prototype.MD5 = MD5;

// vim: shiftwidth=2
