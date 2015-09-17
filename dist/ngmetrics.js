;(function(global){ 
 'use strict';var Digest = function(id) {
  this.id     = id;
  this.cycles = 0;
  this.avg    = 0;
  this.max    = 0;
  this.stack  = '';
};

// vim: shiftwidth=2

var Metrics = function($provide) {
  var metrics = this;
  window.m = this;

  this.orig = {};
  this.digests = {};

  this.decorateMap = {
    '$rootScope': {
      '$digest': function($orig) {
        var digestId = metrics.getHash( (new Error()).stack );
        var digest = metrics.getDigest(digestId);

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

Metrics.prototype.Digest = Digest;
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

Metrics.prototype.getHash = function(str) {
  var hash = 5381,
      i    = str.length;

  while(i) {
    hash = (hash * 33) ^ str.charCodeAt(--i);
  }

  return hash >>> 0;
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

Metrics.prototype.docCookies = {
  getItem: function (sKey) {
    if (!sKey) { return null; }
    return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
  },
  setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
    if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
    var sExpires = "";
    if (vEnd) {
      switch (vEnd.constructor) {
        case Number:
          sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
        break;
        case String:
          sExpires = "; expires=" + vEnd;
        break;
        case Date:
          sExpires = "; expires=" + vEnd.toUTCString();
        break;
      }
    }
    document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
    return true;
  },
  removeItem: function (sKey, sPath, sDomain) {
    if (!this.hasItem(sKey)) { return false; }
    document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "");
    return true;
  },
  hasItem: function (sKey) {
    if (!sKey) { return false; }
    return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
  },
  keys: function () {
    var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
    for (var nLen = aKeys.length, nIdx = 0; nIdx < nLen; nIdx++) { aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]); }
    return aKeys;
  }
};

Metrics.prototype.$get = ['$parse', '$rootScope', '$route', function($parse, $rootScope, $route) {
  this.$parse = $parse;
  this.$rootScope = $rootScope;
  this.$route = $route;

  this.init();

  return this;
}];

// vim: shiftwidth=2

var module = angular.module('ngMetrics', []);

module.provider('ngMetrics', ['$provide', function($provide) {
  return new Metrics($provide);
}]);
// vim: shiftwidth=2
}(this));