/*!
 * deselect.js v0.1.0 (https://github.com/jsenn/deselect.js)
 * Licensed under the MIT License (https://github.com/jsenn/deselect.js/blob/master/LICENSE)
 */

(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
window.deselect = function(select, userOpts) {
  'use strict';
  var _, opts, container, input, inputContainer, dropdown, dropdownContainer,
      badgeContainer, state, clickingDropdown, clickingBadge;

  _ = require('./util');

  opts = require('./opts'); /* default options */

  /* Optionally update defaults with user-given options. */
  if (userOpts !== void 0)
    _.merge(opts, userOpts);

  /* Hide the <select> element. */
  select.style.display = 'none';

  container = window.document.createElement('div');
  _.merge(container, opts.container.attrs);
  _.merge(container.style, opts.container.style);

  input = window.document.createElement('input');
  _.merge(input, opts.input.attrs);
  _.merge(input.style, opts.input.style);

  inputContainer = window.document.createElement('div');
  _.merge(inputContainer, opts.input.container.attrs);
  _.merge(inputContainer.style, opts.input.container.style);
  inputContainer.appendChild(input);

  badgeContainer = window.document.createElement('div');
  _.merge(badgeContainer, opts.badge.container.attrs);
  _.merge(badgeContainer.style, opts.badge.container.style);
  inputContainer.appendChild(badgeContainer);

  container.appendChild(inputContainer);

  dropdown = window.document.createElement('ul');
  _.merge(dropdown, opts.dropdown.attrs);
  _.merge(dropdown.style, opts.dropdown.style);
  dropdown.style.display = 'none';

  dropdownContainer = window.document.createElement('div');
  _.merge(dropdownContainer, opts.dropdown.container.attrs);
  _.merge(dropdownContainer.style, opts.dropdown.container.style);
  dropdownContainer.appendChild(dropdown);

  container.appendChild(dropdownContainer);

  _.insertAfter(select, container);

  state = {
    query: '',
    results: [],
    selected: [],
    focussed: null,
    lastMoveWasUp: false,
    scrollTop: 0
  };

  function clearAllButSelected() {
    state.query = '';
    state.results = [];
    state.focussed = null;
    render();
  }

  function selectOption(o) {
    if (select.multiple)
      state.selected.push(o);
    else
      state.selected = [o];
    clearAllButSelected();
  }

  function resultToLi(result) {
    var hl = _.highlightString(result.result, result.index,
                               result.index + state.query.length,
                               opts.highlight);
    var li = window.document.createElement('li');
    _.merge(li, opts.dropdown.item.attrs);
    _.merge(li.style, opts.dropdown.item.style);
    li.innerHTML = hl || result.object.textContent;
    li.addEventListener('click', function() { selectOption(result.object); }, false);
    return li;
  }

  function optionToBadge(optionElement) {
    var badge = window.document.createElement('div');
    var x = window.document.createElement('span');
    var label = window.document.createElement('span');

    _.merge(badge, opts.badge.attrs);
    _.merge(badge.style, opts.badge.style);

    _.merge(x, opts.badge.x.attrs);
    _.merge(x.style, opts.badge.x.style);

    x.addEventListener('click', function() {
      state.selected = _.filter(_.neq(optionElement), state.selected);
      clearAllButSelected();
    }, false);

    _.merge(label, opts.badge.label.attrs);
    _.merge(label.style, opts.badge.label.style);
    label.textContent = optionElement.textContent;

    badge.appendChild(x);
    badge.appendChild(label);

    return badge;
  }

  function render() {
    var focussedLi;
    input.value = state.query;

    dropdown.innerHTML = '';
    badgeContainer.innerHTML = '';

    _.forEach(state.results, function(result) {
      var li = resultToLi(result);
      dropdown.appendChild(li);
      if (result.object === state.focussed)
        focussedLi = li;
    });

    dropdown.scrollTop = state.scrollTop;
    if (focussedLi !== void 0 && focussedLi !== null) {
      _.addClass(opts.focusClass, focussedLi);
      _.maybeScrollIntoView(focussedLi, dropdown, state.lastMoveWasUp);
      state.scrollTop = dropdown.scrollTop;
    }

    dropdown.style.display = dropdown.children.length >= 1 ? 'block' : 'none';

    _.forEach(select.children, function(o) {
      o.selected = state.selected.indexOf(o) !== -1;
    });

    /* For every selected <option>, add a removable "badge" over the <input>. */
    input.style.paddingLeft = 0;
    _.forEach(state.selected, function(o) {
      var badgeRect, paddingLeft;

      var badge = optionToBadge(o);
      badgeContainer.appendChild(badge);

      /* Shove the input over to make room for the new badge. */
      badgeRect = badge.getBoundingClientRect();
      paddingLeft = parseFloat(input.style.paddingLeft);
      input.style.paddingLeft = paddingLeft + badgeRect.right - badgeRect.left;
    });
  }

  function step(direction) {
    var resultObjects = _.map(_.get('object'), state.results);
    var steps = [input].concat(resultObjects);
    var currentPosition = steps.indexOf(state.focussed);
    /* Choose the next index according to the direction, wrapping around if
     * necessary. The extra `steps.length` is there to handle negative
     * directions (e.g. if `currentPosition` is 0 and `direction` is -1).
     */
    var i_next = (currentPosition + steps.length + direction) % steps.length;
    state.focussed = steps[i_next];
    state.query = state.focussed.textContent;
    render();
  }

  function navigate(e) {
    if (e.shiftKey)
      return true;

    if (opts.keys.select.indexOf(e.keyCode) !== -1) {
      e.stopPropagation();
      selectOption(state.focussed);
    } else if (opts.keys.down.indexOf(e.keyCode) !== -1) {
      e.preventDefault();
      e.stopPropagation();
      state.lastMoveWasUp = false;
      step(1);
    } else if (opts.keys.up.indexOf(e.keyCode) !== -1) {
      e.preventDefault();
      e.stopPropagation();
      state.lastMoveWasUp = true;
      step(-1);
    } else {
      return true;
    }
  }

  function filterOptions() {
    var searchResults = _.search(state.query, select.children);
    state.results = _.filter(function(r) {
      return state.selected.indexOf(r.object) === -1;
    }, searchResults);
  }

  function renderFromInput() {
    state.query = input.value;
    state.focussed = input;
    filterOptions();
    render();
  }

  function ignoreIfMeta(f) {
    return function(e) {
      return (e.ctrlKey || e.altKey) ? true : f(e);
    };
  }

  window.document.addEventListener('mousedown', function(e) {
    if (_.hasAncestor(dropdown, e.target))
      clickingDropdown = true;
    if (_.hasAncestor(badgeContainer, e.target))
      clickingBadge = true;
  }, false);
  window.document.addEventListener('mouseup', function() {
    clickingDropdown = false;
    clickingBadge = false;
  }, false);

  input.addEventListener('focus', renderFromInput, false);
  input.addEventListener('blur', function() {
    if (!clickingDropdown && !clickingBadge)
      clearAllButSelected();
  }, false);

  input.addEventListener('keyup', ignoreIfMeta(navigate), false);
  input.addEventListener('keyup', _.keypresser(ignoreIfMeta(function(e) {
    if (opts.keys.up.indexOf(e.keyCode)      === -1 &&
        opts.keys.select.indexOf(e.keyCode)  === -1 &&
        (opts.keys.down.indexOf(e.keyCode)   === -1 ||
         dropdown.style.display === 'none'))
      renderFromInput();
  })), false);
};


},{"./opts":2,"./util":3}],2:[function(require,module,exports){
module.exports = (function() {
  var classPrefix = 'deselect--';

  return {
    /* The `Event.keyCode`s that we will use to add keyboard controls. */
    keys: {
      up: [38], /* move up */
      down: [40], /* move down */
      select: [13, 32] /* choose an option */
    },

    /* The class that will be added to focussed elements. */
    focusClass: classPrefix + 'focus',

    /* The <div> into which the whole widget will go. */
    container: {
      attrs: {
        className: classPrefix + 'wrapper'
      },
      style: {}
    },

    /* The "search box" users can use to filter options. */
    input: {
      attrs: {
        type: 'text', /* <input type="text"> */
        className: classPrefix + 'search-box'
      },
      style: {
        width: '100%'
      },
      container: {
        attrs: {
          className: classPrefix + 'input-container'
        },
        style: {
          position: 'relative'
        }
      }
    },

    /* The <ul> that will contain the options the user can select. */
    dropdown: {
      attrs: {
        className: classPrefix + 'dropdown',
      },
      style: {
        width: '100%',

        /* Limit the amount of options that can be displayed. Especially useful
         * if there are 100s or 1000s of <option>s.
         */
        maxHeight: '10em',

        /* We don't need any bullet points, special list padding, etc. */
        listStyle: 'none',
        padding: 0,

        /* A convenient default to make the thing look OK out of the box. */
        borderWidth: 1,
        borderStyle: 'solid',

        /* The background needs to be opaque so the elements below don't show. */
        backgroundColor: 'white',

        /* Allow the user to scroll up and down through the options. */
        overflowX: 'hidden',
        overflowY: 'scroll',

        /* Make sure the dropdown renders over top of everything else. */
        zIndex: 100,

        /* Render the dropdown directly below the <input>. */
        marginTop: 0,

        /* Make sure the dropdown doesn't drop everything else down with it! */
        position: 'absolute'
      },
      container: {
        attrs: {
          className: classPrefix + 'dropdown-container'
        },
        style: {
          /* Since the actual dropdown's `absolute`ly `position`ed, we need to
           * position its container relative to the rest of the page.
           */
          position: 'relative'
        }
      },

      /* The <li> that will contain an individual option. */
      item: {
        attrs: {
          className: classPrefix + 'dropdown-item'
        },
        style: {}
      }
    },

    /* The <span> that wraps highlighted results. */
    highlight: {
      attrs: {
        className: classPrefix + 'highlight'
      },
      style: {}
    },

    /* The little things displayed over the <input> that show which options the
     * user has selected.
     */
    badge: {
      attrs: {
        className: classPrefix + 'badge',
      },
      style: {
        float: 'left',
        paddingLeft: '0.5em',
        paddingRight: '0.5em'
      },
      container: {
        attrs: {
          className: classPrefix + 'badge-container'
        },
        style: {
          /* Center the badge vertically. See
           * http://www.smashingmagazine.com/2013/08/09/absolute-horizontal-vertical-centering-css/
           */
          display: 'table',
          height: 'auto',
          margin: 'auto',
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          right: 0
        }
      },

      /* The 'exit button' for the badge. */
      x: {
        attrs: {
          className: classPrefix + 'badge-x',
          innerHTML: '&times;' /* × */
        },
        style: {
          cursor: 'pointer',
          /* Separate it from the label (which is to the right). */
          marginRight: '10px'
        }
      },
      label: {
        attrs: {
          className: classPrefix + 'badge-label'
        },
        style: {}
      }
    }
  };
}());


},{}],3:[function(require,module,exports){
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


},{}]},{},[1,2,3]);
