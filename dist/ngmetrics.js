;(function(global){ 
 "use strict";/* eslint indent:[2,4] */
/*******************************************************************************

YaMD5 - Yet another MD5 hasher.
home: https://github.com/gorhill/yamd5.js

I needed an MD5 hasher, and as usual I want small code base, and fast.

Originally found md5-o-matic [1]. It was fast but did not work with Unicode
strings. Also, eventually realized it was really based on code from
Joseph Myers [2] with no proper credits given (not nice).

Then I found SparkMD5 [3], which works with Unicode strings, but at a steep
cost to performance. Also, glancing at the code I saw avoidable redundancies
causing the code base to be much larger than needed.

So from this point I set out to write my own version, YaMD5 (sorry, I am
not good with naming projects), of course heavily relying on the original
code from Joseph Myers [2], and bits from SparkMD5 -- I started to work from
SparkMD5 implementation, so there might be bits of code original to SparkMD5
code left in a few places (like say, MD5.end()).

Advantages of YaMD5:

- Can handle Unicode strings
- Natively incremental
- Small code base
- Fastest MD5 hasher out there so far for large input [4]
- Even faster than versions supporting only simpler ascii strings


 [1] https://github.com/trentmillar/md5-o-matic
 [2] http://www.myersdaily.org/joseph/javascript/md5-text.html
 [3] https://github.com/satazor/SparkMD5
 [4] http://jsperf.com/md5-shootout/75

So with that said, I don't know what license covers Joseph Myers' code (need
to find out). In any case, concerning whatever original code I contributed in
there:

The MIT License (MIT)

Copyright (C) 2014 Raymond Hill

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

**/

    /*
     * Fastest md5 implementation around (JKM md5)
     * Credits: Joseph Myers
     *
     * @see http://www.myersdaily.org/joseph/javascript/md5-text.html
     * @see http://jsperf.com/md5-shootout/7
     */

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence

    var md5cycle = function(x, k) {
        var a = x[0],
            b = x[1],
            c = x[2],
            d = x[3];
        // ff()
        a += (b & c | ~b & d) + k[0] - 680876936 | 0;
        a  = (a << 7 | a >>> 25) + b | 0;
        d += (a & b | ~a & c) + k[1] - 389564586 | 0;
        d  = (d << 12 | d >>> 20) + a | 0;
        c += (d & a | ~d & b) + k[2] + 606105819 | 0;
        c  = (c << 17 | c >>> 15) + d | 0;
        b += (c & d | ~c & a) + k[3] - 1044525330 | 0;
        b  = (b << 22 | b >>> 10) + c | 0;
        a += (b & c | ~b & d) + k[4] - 176418897 | 0;
        a  = (a << 7 | a >>> 25) + b | 0;
        d += (a & b | ~a & c) + k[5] + 1200080426 | 0;
        d  = (d << 12 | d >>> 20) + a | 0;
        c += (d & a | ~d & b) + k[6] - 1473231341 | 0;
        c  = (c << 17 | c >>> 15) + d | 0;
        b += (c & d | ~c & a) + k[7] - 45705983 | 0;
        b  = (b << 22 | b >>> 10) + c | 0;
        a += (b & c | ~b & d) + k[8] + 1770035416 | 0;
        a  = (a << 7 | a >>> 25) + b | 0;
        d += (a & b | ~a & c) + k[9] - 1958414417 | 0;
        d  = (d << 12 | d >>> 20) + a | 0;
        c += (d & a | ~d & b) + k[10] - 42063 | 0;
        c  = (c << 17 | c >>> 15) + d | 0;
        b += (c & d | ~c & a) + k[11] - 1990404162 | 0;
        b  = (b << 22 | b >>> 10) + c | 0;
        a += (b & c | ~b & d) + k[12] + 1804603682 | 0;
        a  = (a << 7 | a >>> 25) + b | 0;
        d += (a & b | ~a & c) + k[13] - 40341101 | 0;
        d  = (d << 12 | d >>> 20) + a | 0;
        c += (d & a | ~d & b) + k[14] - 1502002290 | 0;
        c  = (c << 17 | c >>> 15) + d | 0;
        b += (c & d | ~c & a) + k[15] + 1236535329 | 0;
        b  = (b << 22 | b >>> 10) + c | 0;
        // gg()
        a += (b & d | c & ~d) + k[1] - 165796510 | 0;
        a  = (a << 5 | a >>> 27) + b | 0;
        d += (a & c | b & ~c) + k[6] - 1069501632 | 0;
        d  = (d << 9 | d >>> 23) + a | 0;
        c += (d & b | a & ~b) + k[11] + 643717713 | 0;
        c  = (c << 14 | c >>> 18) + d | 0;
        b += (c & a | d & ~a) + k[0] - 373897302 | 0;
        b  = (b << 20 | b >>> 12) + c | 0;
        a += (b & d | c & ~d) + k[5] - 701558691 | 0;
        a  = (a << 5 | a >>> 27) + b | 0;
        d += (a & c | b & ~c) + k[10] + 38016083 | 0;
        d  = (d << 9 | d >>> 23) + a | 0;
        c += (d & b | a & ~b) + k[15] - 660478335 | 0;
        c  = (c << 14 | c >>> 18) + d | 0;
        b += (c & a | d & ~a) + k[4] - 405537848 | 0;
        b  = (b << 20 | b >>> 12) + c | 0;
        a += (b & d | c & ~d) + k[9] + 568446438 | 0;
        a  = (a << 5 | a >>> 27) + b | 0;
        d += (a & c | b & ~c) + k[14] - 1019803690 | 0;
        d  = (d << 9 | d >>> 23) + a | 0;
        c += (d & b | a & ~b) + k[3] - 187363961 | 0;
        c  = (c << 14 | c >>> 18) + d | 0;
        b += (c & a | d & ~a) + k[8] + 1163531501 | 0;
        b  = (b << 20 | b >>> 12) + c | 0;
        a += (b & d | c & ~d) + k[13] - 1444681467 | 0;
        a  = (a << 5 | a >>> 27) + b | 0;
        d += (a & c | b & ~c) + k[2] - 51403784 | 0;
        d  = (d << 9 | d >>> 23) + a | 0;
        c += (d & b | a & ~b) + k[7] + 1735328473 | 0;
        c  = (c << 14 | c >>> 18) + d | 0;
        b += (c & a | d & ~a) + k[12] - 1926607734 | 0;
        b  = (b << 20 | b >>> 12) + c | 0;
        // hh()
        a += (b ^ c ^ d) + k[5] - 378558 | 0;
        a  = (a << 4 | a >>> 28) + b | 0;
        d += (a ^ b ^ c) + k[8] - 2022574463 | 0;
        d  = (d << 11 | d >>> 21) + a | 0;
        c += (d ^ a ^ b) + k[11] + 1839030562 | 0;
        c  = (c << 16 | c >>> 16) + d | 0;
        b += (c ^ d ^ a) + k[14] - 35309556 | 0;
        b  = (b << 23 | b >>> 9) + c | 0;
        a += (b ^ c ^ d) + k[1] - 1530992060 | 0;
        a  = (a << 4 | a >>> 28) + b | 0;
        d += (a ^ b ^ c) + k[4] + 1272893353 | 0;
        d  = (d << 11 | d >>> 21) + a | 0;
        c += (d ^ a ^ b) + k[7] - 155497632 | 0;
        c  = (c << 16 | c >>> 16) + d | 0;
        b += (c ^ d ^ a) + k[10] - 1094730640 | 0;
        b  = (b << 23 | b >>> 9) + c | 0;
        a += (b ^ c ^ d) + k[13] + 681279174 | 0;
        a  = (a << 4 | a >>> 28) + b | 0;
        d += (a ^ b ^ c) + k[0] - 358537222 | 0;
        d  = (d << 11 | d >>> 21) + a | 0;
        c += (d ^ a ^ b) + k[3] - 722521979 | 0;
        c  = (c << 16 | c >>> 16) + d | 0;
        b += (c ^ d ^ a) + k[6] + 76029189 | 0;
        b  = (b << 23 | b >>> 9) + c | 0;
        a += (b ^ c ^ d) + k[9] - 640364487 | 0;
        a  = (a << 4 | a >>> 28) + b | 0;
        d += (a ^ b ^ c) + k[12] - 421815835 | 0;
        d  = (d << 11 | d >>> 21) + a | 0;
        c += (d ^ a ^ b) + k[15] + 530742520 | 0;
        c  = (c << 16 | c >>> 16) + d | 0;
        b += (c ^ d ^ a) + k[2] - 995338651 | 0;
        b  = (b << 23 | b >>> 9) + c | 0;
        // ii()
        a += (c ^ (b | ~d)) + k[0] - 198630844 | 0;
        a  = (a << 6 | a >>> 26) + b | 0;
        d += (b ^ (a | ~c)) + k[7] + 1126891415 | 0;
        d  = (d << 10 | d >>> 22) + a | 0;
        c += (a ^ (d | ~b)) + k[14] - 1416354905 | 0;
        c  = (c << 15 | c >>> 17) + d | 0;
        b += (d ^ (c | ~a)) + k[5] - 57434055 | 0;
        b  = (b << 21 |b >>> 11) + c | 0;
        a += (c ^ (b | ~d)) + k[12] + 1700485571 | 0;
        a  = (a << 6 | a >>> 26) + b | 0;
        d += (b ^ (a | ~c)) + k[3] - 1894986606 | 0;
        d  = (d << 10 | d >>> 22) + a | 0;
        c += (a ^ (d | ~b)) + k[10] - 1051523 | 0;
        c  = (c << 15 | c >>> 17) + d | 0;
        b += (d ^ (c | ~a)) + k[1] - 2054922799 | 0;
        b  = (b << 21 |b >>> 11) + c | 0;
        a += (c ^ (b | ~d)) + k[8] + 1873313359 | 0;
        a  = (a << 6 | a >>> 26) + b | 0;
        d += (b ^ (a | ~c)) + k[15] - 30611744 | 0;
        d  = (d << 10 | d >>> 22) + a | 0;
        c += (a ^ (d | ~b)) + k[6] - 1560198380 | 0;
        c  = (c << 15 | c >>> 17) + d | 0;
        b += (d ^ (c | ~a)) + k[13] + 1309151649 | 0;
        b  = (b << 21 |b >>> 11) + c | 0;
        a += (c ^ (b | ~d)) + k[4] - 145523070 | 0;
        a  = (a << 6 | a >>> 26) + b | 0;
        d += (b ^ (a | ~c)) + k[11] - 1120210379 | 0;
        d  = (d << 10 | d >>> 22) + a | 0;
        c += (a ^ (d | ~b)) + k[2] + 718787259 | 0;
        c  = (c << 15 | c >>> 17) + d | 0;
        b += (d ^ (c | ~a)) + k[9] - 343485551 | 0;
        b  = (b << 21 | b >>> 11) + c | 0;

        x[0] = a + x[0] | 0;
        x[1] = b + x[1] | 0;
        x[2] = c + x[2] | 0;
        x[3] = d + x[3] | 0;
    };

    var hexChars = '0123456789abcdef';
    var hexOut = [];

    var hex = function(x) {
        var hc = hexChars;
        var ho = hexOut;
        var n, offset, j;
        for (var i = 0; i < 4; i++) {
            offset = i * 8;
            n = x[i];
            for ( j = 0; j < 8; j += 2 ) {
                ho[offset+1+j] = hc.charAt(n & 0x0F);
                n >>>= 4;
                ho[offset+0+j] = hc.charAt(n & 0x0F);
                n >>>= 4;
            }
        }
        return ho.join('');
    };

    var MD5 = function() {
        this._dataLength = 0;
        this._state = new Int32Array(4);
        this._buffer = new ArrayBuffer(68);
        this._bufferLength = 0;
        this._buffer8 = new Uint8Array(this._buffer, 0, 68);
        this._buffer32 = new Uint32Array(this._buffer, 0, 17);
        this.start();
    };

    var stateIdentity = new Int32Array([1732584193, -271733879, -1732584194, 271733878]);
    var buffer32Identity = new Int32Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

    // Char to code point to to array conversion:
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/charCodeAt#Example.3A_Fixing_charCodeAt_to_handle_non-Basic-Multilingual-Plane_characters_if_their_presence_earlier_in_the_string_is_unknown
    MD5.prototype.appendStr = function(str) {
        var buf8 = this._buffer8;
        var buf32 = this._buffer32;
        var bufLen = this._bufferLength;
        var code;
        for ( var i = 0; i < str.length; i++ ) {
            code = str.charCodeAt(i);
            if ( code < 128 ) {
                buf8[bufLen++] = code;
            } else if ( code < 0x800 ) {
                buf8[bufLen++] = (code >>> 6) + 0xC0;
                buf8[bufLen++] = code & 0x3F | 0x80;
            } else if ( code < 0xD800 || code > 0xDBFF ) {
                buf8[bufLen++] = (code >>> 12) + 0xE0;
                buf8[bufLen++] = (code >>> 6 & 0x3F) | 0x80;
                buf8[bufLen++] = (code & 0x3F) | 0x80;
            } else {
                code = ((code - 0xD800) * 0x400) + (str.charCodeAt(++i) - 0xDC00) + 0x10000;
                if ( code > 0x10FFFF ) {
                    throw 'Unicode standard supports code points up to U+10FFFF';
                }
                buf8[bufLen++] = (code >>> 18) + 0xF0;
                buf8[bufLen++] = (code >>> 12 & 0x3F) | 0x80;
                buf8[bufLen++] = (code >>> 6 & 0x3F) | 0x80;
                buf8[bufLen++] = (code & 0x3F) | 0x80;
            }
            if ( bufLen >= 64 ) {
                this._dataLength += 64;
                md5cycle(this._state, buf32);
                bufLen -= 64;
                buf32[0] = buf32[16];
            }
        }
        this._bufferLength = bufLen;
        return this;
    };

    MD5.prototype.appendAsciiStr = function(str) {
        var buf8 = this._buffer8;
        var buf32 = this._buffer32;
        var bufLen = this._bufferLength;
        var i, j = 0;
        for (;;) {
            i = Math.min(str.length-j, 64-bufLen);
            while ( i-- ) {
                buf8[bufLen++] = str.charCodeAt(j++);
            }
            if ( bufLen < 64 ) {
                break;
            }
            this._dataLength += 64;
            md5cycle(this._state, buf32);
            bufLen = 0;
        }
        this._bufferLength = bufLen;
        return this;
    };

    MD5.prototype.appendByteArray = function(input) {
        var buf8 = this._buffer8;
        var buf32 = this._buffer32;
        var bufLen = this._bufferLength;
        var i, j = 0;
        for (;;) {
            i = Math.min(input.length-j, 64-bufLen);
            while ( i-- ) {
                buf8[bufLen++] = input[j++];
            }
            if ( bufLen < 64 ) {
                break;
            }
            this._dataLength += 64;
            md5cycle(this._state, buf32);
            bufLen = 0;
        }
        this._bufferLength = bufLen;
        return this;
    };

    MD5.prototype.start = function() {
        this._dataLength = 0;
        this._bufferLength = 0;
        this._state.set(stateIdentity);
        return this;
    };

    MD5.prototype.end = function(raw) {
        var bufLen = this._bufferLength;
        this._dataLength += bufLen;
        var buf8 = this._buffer8;
        buf8[bufLen] = 0x80;
        buf8[bufLen+1] =  buf8[bufLen+2] =  buf8[bufLen+3] = 0;
        var buf32 = this._buffer32;
        var i = (bufLen >> 2) + 1;
        buf32.set(buffer32Identity.subarray(i), i);
        if (bufLen > 55) {
            md5cycle(this._state, buf32);
            buf32.set(buffer32Identity);
        }
        // Do the final computation based on the tail and length
        // Beware that the final length may not fit in 32 bits so we take care of that
        var dataBitsLen = this._dataLength * 8;
        if ( dataBitsLen <= 0xFFFFFFFF ) {
            buf32[14] = dataBitsLen;
        } else {
            var matches = dataBitsLen.toString(16).match(/(.*?)(.{0,8})$/);
            var lo = parseInt(matches[2], 16);
            var hi = parseInt(matches[1], 16) || 0;
            buf32[14] = lo;
            buf32[15] = hi;
        }
        md5cycle(this._state, buf32);

        return raw ? this._state : hex(this._state);
    };

    // This permanent instance is to use for one-call hashing
    var onePassHasher = new MD5();

    MD5.hashStr = function(str, raw) {
        return onePassHasher
            .start()
            .appendStr(str)
            .end(raw);
    };

    MD5.hashAsciiStr = function(str, raw) {
        return onePassHasher
            .start()
            .appendAsciiStr(str)
            .end(raw);
    };

/* eslint-disable no-unused-vars */
var docCookies = {
/* eslint-enable */
  getItem: function (sKey) {
    if (!sKey) { return null; }
    return decodeURIComponent(document.cookie.replace(new RegExp('(?:(?:^|.*;)\\s*' + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, '\\$&') + '\\s*\\=\\s*([^;]*).*$)|^.*$'), '$1')) || null;
  },
  setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
    if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
    var sExpires = '';
    if (vEnd) {
      switch (vEnd.constructor) {
      case Number:
        sExpires = vEnd === Infinity ? '; expires=Fri, 31 Dec 9999 23:59:59 GMT' : '; max-age=' + vEnd;
        break;
      case String:
        sExpires = '; expires=' + vEnd;
        break;
      case Date:
        sExpires = '; expires=' + vEnd.toUTCString();
        break;
      }
    }
    document.cookie = encodeURIComponent(sKey) + '=' + encodeURIComponent(sValue) + sExpires + (sDomain ? '; domain=' + sDomain : '') + (sPath ? '; path=' + sPath : '') + (bSecure ? '; secure' : '');
    return true;
  },
  removeItem: function (sKey, sPath, sDomain) {
    if (!this.hasItem(sKey)) { return false; }
    document.cookie = encodeURIComponent(sKey) + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT' + (sDomain ? '; domain=' + sDomain : '') + (sPath ? '; path=' + sPath : '');
    return true;
  },
  hasItem: function (sKey) {
    if (!sKey) { return false; }
    return (new RegExp('(?:^|;\\s*)' + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, '\\$&') + '\\s*\\=')).test(document.cookie);
  },
  keys: function () {
    var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, '').split(/\s*(?:\=[^;]*)?;\s*/);
    for (var nLen = aKeys.length, nIdx = 0; nIdx < nLen; nIdx++) { aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]); }
    return aKeys;
  }
};
// vim: shiftwidth=2

/* eslint-disable no-unused-vars */
var Digest = function(id) {
/* eslint-enable */
  this.id     = id;
  this.cycles = 0;
  this.avg    = 0;
  this.max    = 0;
  this.stack  = '';
};

// vim: shiftwidth=2

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

// Responsiveness metrics tracker

var RS = function(route, events) {
  this.route = route;

  if (events) {
    this.events = events;
  }

  // Make sure event handler called with right context
  this.handleEvent = this.handleEvent.bind(this);

  this.records = [];
};

RS.prototype.records         = null;
RS.prototype.cutoffDelay     = 1000;
RS.prototype.events          = ['click', 'keydown', 'submit', 'mousein'];
RS.prototype.settled         = true;
RS.prototype.currentTimeout  = 0;
RS.prototype.currentEvent    = {};
RS.prototype.currentPath     = '';
RS.prototype.currentUrl      = '',
RS.prototype.eventTimestamp  = 0;
RS.prototype.digests         = [];
RS.prototype.totalDigest     = 0;

RS.prototype.attachEventListeners = function() {
  var rs = this;

  this.events.forEach(function(eventName) {
    document.addEventListener(eventName, rs.handleEvent, true);
  });
};

RS.prototype.detachEventListeners = function() {
  var rs = this;

  this.events.forEach(function(eventName) {
    document.removeEventListener(eventName, rs.handleEvent);
  });
};

RS.prototype.handleEvent = function(e) {
  if (! this.settled) {
    this.settle();
  }

  // Init stats
  this.currentEvent    = e;
  this.settled         = false;
  this.eventTimestamp  = Date.now();
  this.digests         = [];
  this.totalDigest     = 0;
  this.currentPath     = this.route.getCurrentPath();
  this.currentUrl      = this.route.getCurrentUrl();

  this.scheduleSettle();
};

RS.prototype.scheduleSettle = function() {
  this.cancelScheduledSettle();

  if (this.settled) {
    return;
  }

  this.currentTimeout  = setTimeout(this.settle.bind(this), this.cutoffDelay);
};

// this is necessary to deal with super long digests
RS.prototype.cancelScheduledSettle = function() {
  clearTimeout(this.currentTimeout);
  this.currentTimeout = null;
};

RS.prototype.addDigestTime = function(duration, id) {
  if (this.digests.indexOf(id) === -1) {
    this.digests.push(id);
  }

  this.totalDigest += duration;
  this.scheduleSettle();
};

RS.prototype.settle = function() {
  this.settled = true;

  // We do not need to track events which did not incur digest time
  if (this.totalDigest === 0) {
    return;
  }

  var record = {
    path            : this.currentPath,
    url             : this.currentUrl,
    digests         : this.digests,
    totalDigest     : this.totalDigest,
    eventName       : this.currentEvent.type,
    htmlElement     : this.getPath(this.currentEvent.target)
  };

  this.records.push(record);
};

RS.prototype.flush = function() {
  var flushedRecords = this.records;

  this.records = [];

  return flushedRecords;
};

RS.prototype.previousElementSibling = function(element) {
  if (element.previousElementSibling !== 'undefined') {
    return element.previousElementSibling;
  }
  else {
    // Loop through ignoring anything not an element
    element = element.previousSibling;

    while (element) {
      if (element.nodeType === 1) {
        return element;
      }

      element = element.previousSibling;
    }
  }
};

RS.prototype.getPath = function(element) {
  if (! (element instanceof HTMLElement)) {
    return false;
  }

  var path = [];

  while (element && element.nodeType === Node.ELEMENT_NODE) {
    var selector = element.nodeName;

    if (element.id) {
      selector += ('#' + element.id);
    }
    else {
      // Walk backwards until there is no previous sibling
      var sibling = element;

      // Will hold nodeName to join for adjacent selection
      var siblingSelectors = [];

      while (sibling !== null && sibling.nodeType === Node.ELEMENT_NODE) {
        siblingSelectors.unshift(sibling.nodeName);
        sibling = this.previousElementSibling(sibling);
      }

      // :first-child does not apply to HTML
      if (siblingSelectors[0] !== 'HTML') {
        siblingSelectors[0] = siblingSelectors[0] + ':first-child';
      }

      selector = siblingSelectors.join(' + ');
    }

    path.unshift(selector);
    element = element.parentNode;
  }

  return path.join(' > ');
};

// vim: shiftwidth=2

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

var module = angular.module('ngMetrics', []);

module.provider('ngMetrics', ['$provide', function($provide) {
  return new Metrics($provide);
}]);
// vim: shiftwidth=2
}(this));