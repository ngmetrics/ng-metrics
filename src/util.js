/* eslint no-unused-vars:0 */

var Util = {};

Util.previousElementSibling = function(element) {
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

Util.getPath = function(element) {
  if (element && element.length) {
    element = element[0];
  }

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
        sibling = Util.previousElementSibling(sibling);
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

if (performance && performance.now) {
  Util.perf = function() { return performance.now(); };
}
else {
  Util.perf = function() { return Date.now(); };
}
