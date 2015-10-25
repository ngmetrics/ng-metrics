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
    htmlElement     : Util.getPath(this.currentEvent.target)
  };

  this.records.push(record);
};

RS.prototype.flush = function() {
  var flushedRecords = this.records;

  this.records = [];

  return flushedRecords;
};

// vim: shiftwidth=2
