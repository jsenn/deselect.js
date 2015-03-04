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

  /* See http://stackoverflow.com/a/6000016 */
  function isFunction(object) {
    return !!(object && object.constructor && object.call && object.apply);
  }

  /* Merge the second object into the first, recursing into nested objects.
   * Modifies the first object.
   */
  function merge(o1, o2) {
    for (var attr in o2) {
      if (o2.hasOwnProperty(attr)) {
        if (typeof o2[attr] === 'object' && typeof o1[attr] === 'object' &&
            /* `typeof null` -> "object" */
            o2[attr] !== null && o1[attr] !== null &&
            /* `typeof <function>` ~> "object" */
            !isFunction(o2[attr]) && !isFunction(o1[attr])) {
          merge(o1[attr], o2[attr]);
        } else {
          o1[attr] = o2[attr];
        }
      }
    }
  }

  /* Filter the given <option>s down to which contain the given query as a
   * substring, and then sort the results by the index at which the substring
   * starts. Where the indices are equal, prefer shorter strings.
   */
  function search(query, options) {
    var matches = [];
    forEach(options, function(o) {
      var s = o.textContent;
      var substring_index = s.toLowerCase().indexOf(query.toLowerCase());
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
      if (a.index < b.index)
        return -1;
      if (a.index > b.index)
        return 1;

      /* They have the same index, so we'll prefer the shortest one. */
      if (a.result.length < b.result.length)
        return -1;
      if (a.result.length > b.result.length)
        return 1;

      /* They have the same index and length, so we'll consider them equal. */
      return 0;
    });
  }

  /* Wrap the substring of s between the given start and end indices in a
   * <span>, which is configured with the given opt[ion]s.
   */
  function highlightString(s, start, end, opts) {
    if (start === end) /* Nothing to highlight! */
      return s;
    var span = window.document.createElement('span');
    span.className = opts.class;
    span.textContent = s.substring(start, end);
    return s.substring(0, start) + span.outerHTML + s.substring(end);
  }

  /* Scroll the given object into view iff some part of it lies outside its
   * container.
   */
  function maybeScrollIntoView(object, container, alignToTop) {
    var oRect = object.getBoundingClientRect(),
        cRect = container.getBoundingClientRect();
    if (oRect.top < cRect.top       ||
        oRect.bottom > cRect.bottom ||
        oRect.right > cRect.right   ||
        oRect.left < cRect.left) {
      object.scrollIntoView(alignToTop);
    }
  }

  function addClass(className, el) {
    var classes = el.className.split(/\s+/);
    if (!some(function(s) { return s === className; }, classes))
      classes.push(className);
    el.className = classes.join(' ');
  }

  function removeClass(className, el) {
    var classes = el.className.split(/\s+/);
    var newClasses = filter(function(s) { return s !== className; }, classes);
    el.className = newClasses.join(' ');
  }

  /* Insert the element `after` directly after the element `el` (before its next
   * sibling).
   */
  function insertAfter(el, after) {
    el.parentNode.insertBefore(after, el.nextSibling);
  }

  function searchList(start, next, shouldStop, isMatch) {
    var current = start;
    while (!shouldStop(current)) {
      if (isMatch(current))
        return current;
      current = next(current);
    }
    return null;
  }

  function hasAncestor(ancestor, el) {
    return searchList(el.parentNode,
                      function(node) { return node.parentNode; },
                      function(node) { return node === null; },
                      function(node) { return node === ancestor; });
  }

  function searchForElement(start, next) {
    return searchList(start, next, function(node) { return node === null; },
                      function(node) { return node instanceof window.Element; });
  }

  function previousElementSibling(el) {
    return searchForElement(el.previousSibling,
                            function(node) { return node.previousSibling; });
  }

  function nextElementSibling(el) {
    return searchForElement(el.nextSibling,
                            function(node) { return node.nextSibling; });
  }

  function firstElementChild(el) {
    return searchForElement(el.firstChild,
                            function(node) { return node.nextSibling; });
  }

  function lastElementChild(el) {
    return searchForElement(el.lastChild,
                            function(node) { return node.previousSibling; });
  }

  function always(val) {
    return function() { return val; };
  }

  var KeyNavigator = function(el, initial, methods) {
    this.focussed = initial;

    merge(this, methods); /* See KeyNavigator.prototype */

    this.go = function(node) {
      if (node !== null) {
        this.unfocus(this.focussed);
        this.focus(node);
        this.focussed = node;
      }
    };

    /* Must be bound to this object. */
    var onkeydown = function(e) {
      var handleNavigationTo = function(node) {
        if (node !== null) {
          e.preventDefault();
          e.stopPropagation();
          return this.go(node);
        }
      }.bind(this);

      if (e.altKey || e.ctrlKey || e.shiftKey)
        /* Ignore the event. */
        return true;

      switch (e.keyCode) {
        case 13: /* space */
        case 32: /* enter */
          e.stopPropagation();
          return this.select(this.focussed);

        case 37: /* left arrow key */
          return handleNavigationTo(this.getLeft(this.focussed));
        case 38: /* up arrow key */
          return handleNavigationTo(this.getUp(this.focussed));
        case 39: /* right arrow key */
          return handleNavigationTo(this.getRight(this.focussed));
        case 40: /* down arrow key */
          return handleNavigationTo(this.getDown(this.focussed));

        default:
          /* Ignore the event. */
          return true;
      }
    }.bind(this);

    el.addEventListener('keydown', onkeydown, false);
  };

  KeyNavigator.prototype = {
    getUp:    always(null),
    getDown:  always(null),
    getLeft:  always(null),
    getRight: always(null),
    focus:    always(void 0),
    unfocus:  always(void 0),
    select:   always(void 0)
  };

  return {
    forEach: forEach,
    map: map,
    filter: filter,
    some: some,
    isFunction: isFunction,
    merge: merge,
    hasAncestor: hasAncestor,
    search: search,
    highlightString: highlightString,
    addClass: addClass,
    removeClass: removeClass,
    insertAfter: insertAfter,
    maybeScrollIntoView: maybeScrollIntoView,
    previousElementSibling: previousElementSibling,
    nextElementSibling: nextElementSibling,
    firstElementChild: firstElementChild,
    lastElementChild: lastElementChild,
    always: always,
    KeyNavigator: KeyNavigator
  };

}());

