// Responsiveness metrics tracker

var RS = function($route, events) {
  var rs = this;

  this.$route = $route;

  if (events) {
    this.events = events;
  }

  // Make sure event handler called with right context
  this.handleEvent = this.handleEvent.bind(this);

  this.records = [];
};

RS.prototype.records         = null;
RS.prototype.cutoffDelay     = 100;
RS.prototype.events          = ['click', 'keydown', 'submit', 'mousein'];
RS.prototype.settled         = true;
RS.prototype.currentTimeout  = 0;
RS.prototype.currentEvent    = {};
RS.prototype.currentPath     = '';
RS.prototype.eventTimestamp  = 0;
RS.prototype.digestTimeTotal = 0;

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
  if (this.currentTimeout) {
    clearTimeout(this.currentTimeout);
  }

  if (! this.settled) {
    this.settle();
  }

  // Init stats
  this.currentTimeout  = setTimeout(this.settle.bind(this), this.cutoffDelay);
  this.currentEvent    = e;
  this.settled         = false;
  this.eventTimestamp  = Date.now();
  this.digestTimeTotal = 0;

  // Save current route
  if (this.$route.current && !this.$route.current.$$route) {
    this.currentPath = this.$route.current.$$route.originalPath;
  }
};

RS.prototype.addDigestTime = function(duration) {
  this.digestTimeTotal += duration;
};

RS.prototype.settle = function() {
  this.settled = true;

  // We do not need to track events which did not incur digest time
  if (this.digestTimeTotal === 0) {
    return;
  }

  var record = {
    path            : this.currentPath,
    digestTimeTotal : this.digestTimeTotal,
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
    while (element = element.previousSibling) {
      if (element.nodeType === 1) {
        return element;
      }
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
