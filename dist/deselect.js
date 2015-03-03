(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function () {
  'use strict';

  var _ = require('./util');

  function clearDropdown(dd) {
    dd.style.display = 'none';
    dd.innerHTML = '';
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

    if (search_results.length === 0) {
      return; /* Don't bother displaying the dropdown. */
    }

    /* Display the results */
    _.forEach(search_results, function (result) {
      var li = window.document.createElement('li');
      li.className = opts.dropdownItem.class;

      li.innerHTML = _.highlightString(result.result, result.index,
                                     result.index + searchString.length,
                                     opts.highlight);
      li.addEventListener('click', function() {
        result.object.selected = true;
        input.value = this.textContent;
        clearDropdown(dropdown);
      }, false);

      dropdown.appendChild(li);
    });

    dropdown.style.display = 'block';
  }

  /* Return a callback that will call the given (0-arity) function `f` after the
   * callback hasn't been called in the given number of milliseconds. This can
   * be used as a keypress event callback to avoid calling the function `f` too
   * many times. (i.e. If the user types fast, there's probably no value in
   * calling `f` on every key stroke.)
   */
  function keypresser(f, ms) {
    var timeoutID;
    /* Use 100 as a default for `ms`. */
    if (ms === void 0) {
      ms = 100;
    }

    return function(e) {
      /* If there's an active timer, nuke it. */
      if (timeoutID === void 0) {
        window.clearTimeout(timeoutID);
      }
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
    var opts, select, input, dropdown, dropdownContainer,
        container, keynav, lastMoveWasUp, current_click;
    /* Default options */
    opts = {
      container: {
        attrs: {
          id: '',
          className: 'deselect--wrapper'
        }
      },
      input: {
        attrs: {
          id: '',
          type: 'text',
          value: '',
          placeholder: '',
          className: 'deselect--search-box'
        }
      },
      dropdown: {
        attrs: {
          id: '',
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
          id: '',
          className: 'deselect--dropdown-container'
        }
      },
      dropdownItem: {
        class: 'deselect--dropdown-item',
      },
      highlight: {
        class: 'deselect--highlight'
      },

      focusClass: 'deselect--focus',
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

    /* Create the <ul> that will represent the list of <option>s that match the
     * user's query.
     */
    dropdown = window.document.createElement('ul');
    _.merge(dropdown, opts.dropdown.attrs);

    _.merge(dropdown.style, opts.dropdown.style);

    /* Override default list styling. */
    dropdown.style.listStyle = 'none';
    dropdown.style.padding = 0;

    dropdown.style.width = '100%';
    dropdown.style.position = 'absolute';

    dropdown.style.display = 'none';

    dropdownContainer = window.document.createElement('div');
    _.merge(dropdownContainer, opts.dropdownContainer.attrs);

    dropdownContainer.style.width = '100%';
    dropdownContainer.style.position = 'relative';

    /* Create the <div> in which the entire widget will reside. */
    container = window.document.createElement('div');
    _.merge(container, opts.container.attrs);

    /* Stack the dolls. */
    container.appendChild(input);
    dropdownContainer.appendChild(dropdown);
    container.appendChild(dropdownContainer);

    /* Hide the <select>. */
    select.style.display = 'none';

    /* Put the whole thing directly after the <select> (before its next sibling) */
    select.parentNode.insertBefore(container, select.nextSibling);

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
        _.addClass(opts.focusClass, node);
        _.maybeScrollIntoView(node, dropdown, lastMoveWasUp);
      },
      unfocus: function(node) {
        if (node === void 0) {
          keynav.focussed = null;
        } else {
          _.removeClass(opts.focusClass, node);
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
    }), false);

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
      if (!clicked_dropdown) {
        clearDropdown(dropdown);
        keynav.unfocus(input);
      }
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

  /* Merge o2 into o1, recursing into nested objects. Modifies o1. */
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

  /* Filter the given `options` down to which contain the given `query` as a
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
        oRect.left < cRect.left) {
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
      for (var name in methods) {
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
    some: some,
    isFunction: isFunction,
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


},{}]},{},[1,2]);
