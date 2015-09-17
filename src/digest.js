var Digest = function(id) {
  this.id     = id;
  this.cycles = 0;
  this.avg    = 0;
  this.max    = 0;
  this.stack  = '';
};

// vim: shiftwidth=2
