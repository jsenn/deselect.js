/*!
 * deselect.js v0.1.0 (https://github.com/jsenn/deselect.js)
 * Licensed under the MIT License (https://github.com/jsenn/deselect.js/blob/master/LICENSE)
 */

(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function () {
  'use strict';

  var _ = require('./util');

  function clearDropdown(dd) {
    dd.style.display = 'none';
    dd.innerHTML = '';
  }

  function Badge(text, opts) {
    this.x = window.document.createElement('span');
    _.merge(this.x, opts.x.attrs);
    _.merge(this.x.style, opts.x.style);

    this.label = window.document.createElement('span');
    _.merge(this.label, opts.label.attrs);
    _.merge(this.label.style, opts.label.style);
    this.label.textContent = text;

    this.el = window.document.createElement('div');
    _.merge(this.el, opts.attrs);
    _.merge(this.el.style, opts.style);
    this.el.appendChild(this.x);
    this.el.appendChild(this.label);
  }

  function dropdownItemClicker(input, dropdown, result, opts) {
    return function() {
      var badgeRect,
          inputPaddingLeft;
      var badge = new Badge(this.textContent, opts.badge);

      badge.x.addEventListener('click', function() {
        var inputPaddingLeft, newPaddingLeft;
        var badgeRect = badge.el.getBoundingClientRect();
        result.object.selected = false;
        badge.el.parentNode.removeChild(badge.el);
        inputPaddingLeft = parseFloat(input.style.paddingLeft, 10);
        newPaddingLeft = inputPaddingLeft - (badgeRect.right - badgeRect.left);
        input.style.paddingLeft = newPaddingLeft;
      }, false);

      result.object.selected = true;
      input.value = '';
      input.parentNode.appendChild(badge.el);
      badgeRect = badge.el.getBoundingClientRect();
      inputPaddingLeft = parseFloat(input.style.paddingLeft, 10) || 0;
      input.style.paddingLeft = inputPaddingLeft + badgeRect.right - badgeRect.left;
      clearDropdown(dropdown);
    };
  }

  function updateDropdown(dropdown, input, options, searchString, opts) {
    var search_results;
    clearDropdown(dropdown);

    if (searchString) {
      search_results = _.search(searchString, options);
    } else {
      /* Display all options in the order in which they're given. */
      search_results = _.map(function(o) {
        return {
          object: o,
          result: o.textContent,
          index: 0
        };
      }, options);
    }

    if (search_results.length === 0)
      return; /* Don't bother displaying the dropdown. */

    /* Display the results */
    _.forEach(search_results, function (result) {
      var li = window.document.createElement('li');
      li.className = opts.dropdownItem.class;

      li.innerHTML = _.highlightString(result.result, result.index,
                                       result.index + searchString.length,
                                       opts.highlight);
      li.addEventListener('click',
                          dropdownItemClicker(input, dropdown, result, opts),
                          false);

      dropdown.appendChild(li);
    });

    dropdown.style.display = 'block';
  }

  /* Return a callback that will call the given function `f` after the
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

  /* Main entry point. Hide the <select> with the given ID and replace it with
   * an <input> that can be used to filter down <option>s, which are displayed
   * in a dropdown below. For <select multiple>s, there's an option to add
   * more of these.
   *
   * +-------------------------+
   * | second                x |
   * +-------------------------+
   *
   * +-------------------------+ +---+
   * | ir                      | | + |
   * +-------------------------+ +---+
   * | first                +-+|
   * |  --                  |@||
   * | third                |@||
   * |   --                 | ||
   * | twenty-third         | ||
   * |          --          +-+|
   * +-------------------------+
   *
   */
  window.deselect = function(selectID, userOpts) {
    var opts, select, input, inputContainer, dropdown, dropdownContainer,
        container, keynav, lastMoveWasUp, current_click;
    /* Default options */
    opts = {
      container: {
        attrs: {
          className: 'deselect--wrapper'
        }
      },
      input: {
        attrs: {
          type: 'text',
          className: 'deselect--search-box'
        }
      },
      inputContainer: {
        attrs: {
          className: 'deselect--input-container'
        }
      },
      dropdown: {
        attrs: {
          className: 'deselect--dropdown',
        },
        style: {
          maxHeight: '10em',
          overflowX: 'hidden',
          overflowY: 'scroll',
          zIndex: 100,
          marginTop: 0
        }
      },
      dropdownContainer: {
        attrs: {
          className: 'deselect--dropdown-container'
        }
      },
      dropdownItem: {
        class: 'deselect--dropdown-item',
      },
      highlight: {
        class: 'deselect--highlight'
      },
      focus: {
        class: 'deselect--focus'
      },
      badge: {
        attrs: {
          className: 'deselect--badge',
        },
        style: {
          position: 'absolute',
          height: '50%',
          top: '25%',
          paddingLeft: '0.5em',
          paddingRight: '0.5em'
        },
        x: {
          attrs: {
            className: 'deselect--badge-x',
            innerHTML: '&times;'
          },
          style: {
            cursor: 'pointer',
            marginRight: '10px'
          }
        },
        label: {
          attrs: {
            className: 'deselect--badge-label'
          },
          style: {
          }
        }
      }
    };
    /* Optionally update defaults with user-given options. */
    if (userOpts !== void 0)
      _.merge(opts, userOpts);

    select = window.document.getElementById(selectID);

    /* Create the <input> into which the user can enter their searches. */
    input = window.document.createElement('input');
    input.disabled = select.disabled;
    input.required = select.required;
    _.merge(input, opts.input.attrs);
    input.style.width = '100%';

    inputContainer = window.document.createElement('div');
    _.merge(inputContainer, opts.inputContainer.attrs);

    inputContainer.style.position = 'relative';

    /* Create the <ul> that will represent the list of <option>s that match the
     * user's query.
     */
    dropdown = window.document.createElement('ul');
    _.merge(dropdown, opts.dropdown.attrs);
    _.merge(dropdown.style, opts.dropdown.style);
    dropdown.style.width = '100%';

    /* Override default list styling. */
    dropdown.style.listStyle = 'none';
    dropdown.style.padding = 0;

    /* Make sure it doesn't drop everything else down with it! */
    dropdown.style.position = 'absolute';

    /* Don't display it until we're told to. */
    dropdown.style.display = 'none';

    dropdownContainer = window.document.createElement('div');
    _.merge(dropdownContainer, opts.dropdownContainer.attrs);

    dropdownContainer.style.width = '100%';
    dropdownContainer.style.position = 'relative';

    /* Create the <div> in which the entire widget will reside. */
    container = window.document.createElement('div');
    _.merge(container, opts.container.attrs);

    /* Stack the dolls. */
    inputContainer.appendChild(input);
    dropdownContainer.appendChild(dropdown);
    container.appendChild(inputContainer);
    container.appendChild(dropdownContainer);

    /* Hide the <select>. */
    //select.style.display = 'none';

    /* Put the whole thing directly after the <select>. */
    _.insertAfter(select, container);

    lastMoveWasUp = false;
    keynav = new _.KeyNavigator(container, input, {
      getDown: function(node) {
        lastMoveWasUp = false;
        switch (node) {
          case input:
            return _.firstElementChild(dropdown);
          case _.lastElementChild(dropdown):
            return input; /* wrap around */
          default:
            return _.nextElementSibling(node);
        }
      },
      getUp: function(node) {
        lastMoveWasUp = true;
        switch (node) {
          case input:
            return _.lastElementChild(dropdown); /* wrap around */
          case _.firstElementChild(dropdown):
            return input;
          default:
            return _.previousElementSibling(node);
        }
      },
      focus: function(node) {
        _.addClass(opts.focus.class, node);
        _.maybeScrollIntoView(node, dropdown, lastMoveWasUp);
      },
      unfocus: function(node) {
        if (node === void 0) {
          keynav.focussed = null;
        } else {
          _.removeClass(opts.focus.class, node);
        }
      },
      select: function(node) {
        node.click();
      }
    });

    /* When the user's done typing, show them which options match their query. */
    input.addEventListener('keyup', keypresser(function(e) {
      if (e.keyCode !== 13 && /* enter */
          e.keyCode !== 32 && /* space */
          !(37 <= e.keyCode && 40 >= e.keyCode)) { /* arrow keys */
        updateDropdown(dropdown, input, select.children, input.value, opts);
        keynav.go(input);
      }
    }, 100), false);

    /* Always show the user their options when the <input> is focussed. */
    input.addEventListener('focus', function() {
      updateDropdown(dropdown, input, select.children, input.value, opts);
      keynav.go(input);
    }, false);

    /* Keep track of the currently clicked element so we can hide the dropdown. */
    current_click = null;
    window.document.addEventListener('mousedown', function(e) {
      current_click = e.target;
    }, false);
    window.document.addEventListener('mouseup', function() {
      current_click = null;
    }, false);

    /* If the <input> loses focus, hide the dropdown unless it's being clicked.
     * (If it is, we might need to do stuff with it first.)
     */
    input.addEventListener('blur', function() {
      var clicked_dropdown = current_click !== null &&
                             _.hasAncestor(dropdown, current_click);
      if (!clicked_dropdown)
        clearDropdown(dropdown);
      keynav.unfocus(keynav.focussed);
      input.value = '';
    }, false);
  };
}());


},{"./util":2}],2:[function(require,module,exports){
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


},{}]},{},[1,2]);
