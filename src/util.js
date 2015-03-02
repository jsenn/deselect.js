module.exports = (function() {
  'use strict';

  function forEach(xs, f) {
    for (var i = 0; i < xs.length; i++) {
      f(xs[i]);
    }
  }

  function map(f, xs) {
    var ys = [];
    forEach(xs, function(x) {
      ys.push(f(x));
    });
    return ys;
  }

  function filter(p, xs) {
    var xs_p = [];
    forEach(xs, function(x) {
      if (p(x))
        xs_p.push(x);
    });
    return xs_p;
  }

  function some(p, xs) {
    for (var i = 0; i < xs.length; i++) {
      if (p(xs[i]))
        return true;
    }
    return false;
  }

  /* Merge o2 into o1, recursing into nested objects. Modifies o1. */
  function merge(o1, o2) {
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
  }

  /* Filter the given `options` down to which contain the given `query` as a
   * substring, and then sort the results by the index at which the substring
   * starts. Where the indices are equal, prefer shorter strings.
   */
  function search(query, options) {
    var matches = [];
    forEach(options, function(o) {
      var s = o.textContent;
      var substring_index = s.toLowerCase().indexOf(query);
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
  }

  function highlightString(s, start, end, opts) {
    if (start === end) { /* Nothing to highlight! */
      return s;
    }
    var span = window.document.createElement('span');
    span.className = opts.class;
    span.textContent = s.substring(start, end);
    return s.substring(0, start) + span.outerHTML + s.substring(end);
  }

  function maybeScrollIntoView(object, container, alignToTop) {
    var oRect = object.getBoundingClientRect(),
        cRect = container.getBoundingClientRect();
    if (oRect.top < cRect.top       ||
        oRect.bottom > cRect.bottom ||
        oRect.right > cRect.right   ||
        oRect.Left < cRect.left) {
      object.scrollIntoView(alignToTop);
    }
  }

  function searchList(start, next, shouldStop, isMatch) {
    var current = start;
    while (!shouldStop(current)) {
      if (isMatch(current)) {
        return current;
      }
      current = next(current);
    }
    return null;
  }

  function addClass(className, el) {
    var classes = [].slice.call(el.classList);
    if (!some(function(s) { return s === className; }, classes)) {
      classes.push(className);
    }
    el.className = classes.join(' ');
  }

  function removeClass(className, el) {
    var classes = [].slice.call(el.classList);
    var newClasses = filter(function(s) { return s !== className; }, classes);
    el.className = newClasses.join(' ');
  }

  function hasAncestor(ancestor, el) {
    return searchList(el.parentNode,
                      function(node) { return node.parentNode; },
                      function(node) { return node === null; },
                      function(node) { return node === ancestor; });
  }

  function previousElementSibling(el) {
    return searchList(el.previousSibling,
                      function(node) { return node.previousSibling; },
                      function(node) { return node === null; },
                      function(node) { return node instanceof window.Element; });
  }

  function nextElementSibling(el) {
    return searchList(el.nextSibling,
                      function(node) { return node.nextSibling; },
                      function(node) { return node === null; },
                      function(node) { return node instanceof window.Element; });
  }

  function firstElementChild(el) {
    return searchList(el.firstChild,
                      function(node) { return node.nextSibling; },
                      function(node) { return node === null; },
                      function(node) { return node instanceof window.Element; });
  }

  function lastElementChild(el) {
    return searchList(el.lastChild,
                      function(node) { return node.previousSibling; },
                      function(node) { return node === null; },
                      function(node) { return node instanceof window.Element; });
  }

  function always(val) {
    return function() { return val; };
  }

  var KeyNavigator = function (el, initial, methods) {
    this.focussed = initial;

    if (methods) {
      for (name in methods) {
        if (methods.hasOwnProperty(name)) {
          this[name] = methods[name];
        }
      }
    }

    this.go = function(node) {
      if (node !== null) {
        this.unfocus(this.focussed);
        this.focus(node);
        this.focussed = node;
      }
    };

    /* Must be bound to this object. */
    var onkeydown = function(e) {
      if (e.altKey || e.ctrlKey || e.shiftKey) {
        return true;
      }

      switch (e.keyCode) {
        case 13:
        case 32:
          e.stopPropagation();
          return this.select(this.focussed);

        case 37:
          e.preventDefault();
          e.stopPropagation();
          return this.go(this.getLeft(this.focussed));
        case 38:
          e.preventDefault();
          e.stopPropagation();
          return this.go(this.getUp(this.focussed));
        case 39:
          e.preventDefault();
          e.stopPropagation();
          return this.go(this.getRight(this.focussed));
        case 40:
          e.preventDefault();
          e.stopPropagation();
          return this.go(this.getDown(this.focussed));

        default:
          return true;
      }
    };

    el.addEventListener('keydown', onkeydown.bind(this), false);
  };

  KeyNavigator.prototype = {
    getLeft: always(null),
    getDown: always(null),
    getRight: always(null),
    getUp: always(null),
    focus: always(void 0),
    unfocus: always(void 0),
    select: always(void 0)
  };

  return {
    forEach: forEach,
    map: map,
    filter: filter,
    merge: merge,
    hasAncestor: hasAncestor,
    search: search,
    highlightString: highlightString,
    addClass: addClass,
    removeClass: removeClass,
    maybeScrollIntoView: maybeScrollIntoView,
    previousElementSibling: previousElementSibling,
    nextElementSibling: nextElementSibling,
    firstElementChild: firstElementChild,
    lastElementChild: lastElementChild,
    always: always,
    KeyNavigator: KeyNavigator
  };

}());

