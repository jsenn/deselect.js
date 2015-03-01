module.exports = (function() {
  'use strict';

  var exports = {};

  exports.forEach = function(xs, f) {
    for (var i = 0; i < xs.length; i++) {
      f(xs[i]);
    }
  };

  exports.map = function(f, xs) {
    var ys = [];
    for (var i = 0; i < xs.length; i++) {
      ys.push(f(xs[i]));
    }
    return ys;
  };

  /* Merge o2 into o1, recursing into nested objects. Modifies o1. */
  exports.merge = function(o1, o2) {
    for (var attr in o2) {
      if (o2.hasOwnProperty(attr)) {
        if (typeof o2[attr] === 'object' &&
            typeof o1[attr] === 'object' &&
            /* `typeof null` -> "object" */
            o2[attr] !== null &&
            o1[attr] !== null) {
          merge(o1[attr], o2[attr]);
        } else {
          o1[attr] = o2[attr];
        }
      }
    }
  };

  exports.hasAncestor = function(ancestor, el) {
    /* Travel up the DOM tree until we either find the given `ancestor` or can't
     * go higher.
     */
    var current = el.parentNode;
    while (current !== null) { /* `document.parentNode` -> `null`. */
      if (current === ancestor) {
        return true;
      }
      current = current.parentNode;
    }
    return false;
  };

  /* Filter the given `options` down to which contain the given `query` as a
   * substring, and then sort the results by the index at which the substring
   * starts. Where the indices are equal, prefer shorter strings.
   */
  exports.search = function(query, options) {
    var matches = [];
    exports.forEach(options, function(o) {
      var s = o.textContent;
      var substring_index = s.indexOf(query);
      if (substring_index !== -1) {
        matches.push({
          object: o,
          result: s,
          index: substring_index
        });
      }
    });

    return matches.sort(function(a, b) {
      /* First, sort by index. */
      if (a.index < b.index) {
        return -1;
      }
      if (a.index > b.index) {
        return 1;
      }
      /* They have the same index, so we'll prefer the shortest one. */
      if (a.result.length < b.result.length) {
        return -1;
      }
      if (a.result.length > b.result.length) {
        return 1;
      }
      /* They have the same index and length, so we'll consider them equal. */
      return 0;
    });
  };

  exports.highlightString = function(s, start, end, opts) {
    if (start === end) { /* Nothing to highlight! */
      return s;
    }
    var span = window.document.createElement('span');
    span.className = opts.class;
    span.textContent = s.substring(start, end);
    return s.substring(0, start) + span.outerHTML + s.substring(end);
  };

  exports.keyNavigator = function(getItems, focusItem, unfocusItem, selectItem) {
    var focussedIndex = 0,
        keys = {
          enter: 13,
          space: 32,

          left:  37,
          up:    38,
          right: 39,
          down:  40
        };
    return function(e) {
      var items;

      if (e.altKey || e.ctrlKey || e.shiftKey) {
        return true; /* bail */
      }

      items = getItems();
      if (items.length === 0) {
        return true; /* bail */
      }
      if (items.length === 1) {
        focussedIndex = 0;
        return true; /* bail */
      }

      switch (e.keyCode) {
        case keys.space:
        case keys.enter: {
          selectItem(items[focussedIndex]);
          e.stopPropagation();
          return false;
        }

        case keys.left:
        case keys.up: {
          unfocusItem(items[focussedIndex]);
          focussedIndex = (items.length + focussedIndex - 1) % items.length
          focusItem(items[focussedIndex]);
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
        case keys.right:
        case keys.down: {
          unfocusItem(items[focussedIndex]);
          focussedIndex = (items.length + focussedIndex + 1) % items.length
          focusItem(items[focussedIndex]);
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
        default:
          return true; /* bail */
      }
    };
  };

  return exports;
}());
