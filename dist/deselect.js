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

  function focusDropdownItem(li) {
    li.style.border = "1px solid red"
  }

  function unfocusDropdownItem(li) {
    li.style.border = "none";
  }

  function selectDropdownItem(li) {
    li.click()
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

    return function() {
      /* If there's an active timer, nuke it. */
      if (timeoutID === void 0) {
        window.clearTimeout(timeoutID);
      }
      /* [re]start the timer. */
      timeoutID = window.setTimeout(f, ms);
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
    var opts, select, input, dropdown, dropdownContainer, container, current_click;
    /* Default options */
    opts = {
      container: {
        id: '',
        class: 'deselect--wrapper'
      },
      input: {
        id: '',
        type: 'text',
        value: '',
        placeholder: '',
        class: 'deselect--search-box'
      },
      dropdown: {
        id: '',
        class: 'deselect--dropdown',
        maxHeight: '10em',
        overflowX: 'hidden',
        overflowY: 'scroll',
        zIndex: 100,
        pixelsFromInput: 0
      },
      dropdownContainer: {
        id: '',
        class: 'deselect--dropdown-container'
      },
      dropdownItem: {
        class: 'deselect--dropdown-item',
      },
      highlight: {
        class: 'deselect--highlight'
      }
    };
    /* Optionally update defaults with user-given options. */
    if (userOpts !== void 0) {
      _.merge(opts, userOpts);
    }

    select = window.document.getElementById(selectID);

    /* Create the <input> into which the user can enter their searches. */
    input = window.document.createElement('input');

    input.id = opts.input.id;
    input.type = opts.input.type;
    input.className = opts.input.class;
    input.value = opts.input.value;
    input.placeholder = opts.input.placeholder;

    input.disabled = select.disabled;
    input.required = select.required;

    input.style.width = '100%';

    /* Create the <ul> that will represent the list of <option>s that match the
     * user's query.
     */
    dropdown = window.document.createElement('ul');
    dropdown.id = opts.dropdown.id;
    dropdown.className = opts.dropdown.class;

    dropdown.style.maxHeight = opts.dropdown.maxHeight;
    dropdown.style.overflowX = opts.dropdown.overflowX;
    dropdown.style.overflowY = opts.dropdown.overflowY;

    /* Override default list styling. */
    dropdown.style.listStyle = 'none';
    dropdown.style.padding = 0;
    dropdown.style.marginTop = opts.dropdown.pixelsFromInput;

    dropdown.style.width = '100%';
    dropdown.style.position = 'absolute';
    dropdown.style.zIndex = opts.dropdown.zIndex;

    dropdown.style.display = 'none';

    dropdownContainer = window.document.createElement('div');
    dropdownContainer.id = opts.dropdownContainer.id;
    dropdownContainer.className = opts.dropdownContainer.class;

    dropdownContainer.style.width = '100%';
    dropdownContainer.style.position = 'relative';

    /* Create the <div> in which the entire widget will reside. */
    container = window.document.createElement('div');
    container.id = opts.container.id;
    container.className = opts.container.class;

    /* Stack the dolls. */
    container.appendChild(input);
    dropdownContainer.appendChild(dropdown);
    container.appendChild(dropdownContainer);

    /* Hide the <select>. */
    select.style.display = 'none';

    /* Put the whole thing directly after the <select> (before its next sibling) */
    select.parentNode.insertBefore(container, select.nextSibling);

    container.addEventListener('keydown', _.keyNavigator(
      function() {
        var xs = [input].concat([].slice.call(dropdown.children));
        return xs;
      },
      function(item) {
        console.log("focussing " + item.outerHTML);
        if (item !== input) {
          focusDropdownItem(item);
        }
      },
      function(item) {
        console.log("unfocussing " + item.outerHTML);
        if (item !== input) {
          unfocusDropdownItem(item);
        }
      },
      function(item) {
        console.log("selecting " + item.outerHTML);
        if (item !== input) {
          selectDropdownItem(item);
        }
      }
    ), false);

    /* When the user's done typing, show them which options match their query. */
    input.addEventListener('keyup', keypresser(function() {
      updateDropdown(dropdown, input, select.children, input.value, opts);
    }), false);

    /* Always show the user their options when the <input> is focussed. */
    input.addEventListener('focus', function() {
      updateDropdown(dropdown, input, select.children, input.value, opts);
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
      }
    }, false);
  };
}());


},{"./util":2}],2:[function(require,module,exports){
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

},{}]},{},[1,2]);
