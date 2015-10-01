var RS = function(events) {
    var rs = this;

    if (events) {
        this.events = events;
    }

    // Make sure event handler called with right context
    this.handleEvent = this.handleEvent.bind(this);

    this.attachEventListeners();
};

RS.prototype.events = ['click', 'hover'];
RS.prototype.settled = true;
RS.prototype.currentTimeout = null;
RS.prototype.currentEvent = null;
RS.prototype.eventTimestamp = null;
RS.prototype.digestTimeTotal = 0;

RS.prototype.attachEventListeners = function() {
    var rs = this;

    this.events.forEach(function(eventName) {
        document.addEventListener(eventName, rs.handleEvent);
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
};

RS.prototype.settle = function() {
};
