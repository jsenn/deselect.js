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
    merge(span, opts.attrs);
    merge(span.style, opts.style);
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
    if (classes.indexOf(className) === -1)
      classes.push(className);
    el.className = classes.join(' ');
  }

  function removeClass(className, el) {
    var classes = el.className.split(/\s+/);
    var newClasses = filter(neq(className), classes);
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

  function neq(val) {
    return function(x) { return x !== val; };
  }

  function get(attrName) {
    return function(object) {
      return object[attrName];
    };
  }

  /* Return a callback that will call the given (unary) function `f` after the
   * callback hasn't been called in the given number of milliseconds. This can
   * be used as a keypress event callback to avoid calling the function `f` too
   * many times. (i.e. If the user types fast, there's probably no value in
   * calling `f` on every key stroke.)
   */
  function keypresser(f, ms) {
    var timeoutID;
    return function(e) {
      /* If there's an active timer, nuke it. */
      if (timeoutID === void 0)
        window.clearTimeout(timeoutID);
      /* [re]start the timer. */
      timeoutID = window.setTimeout(function() { return f(e); }, ms);
    };
  }

  return {
    forEach: forEach,
    map: map,
    filter: filter,
    isFunction: isFunction,
    merge: merge,
    hasAncestor: hasAncestor,
    search: search,
    highlightString: highlightString,
    addClass: addClass,
    removeClass: removeClass,
    insertAfter: insertAfter,
    maybeScrollIntoView: maybeScrollIntoView,
    get: get,
    neq: neq,
    keypresser: keypresser,
  };

}());

