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

    if (search_results.length === 0)
      return; /* Don't bother displaying the dropdown. */

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

  /* Return a callback that will call the given function `f` after the
   * callback hasn't been called in the given number of milliseconds. This can
   * be used as a keypress event callback to avoid calling the function `f` too
   * many times. (i.e. If the user types fast, there's probably no value in
   * calling `f` on every key stroke.)
   */
  function keypresser(f, ms) {
    var timeoutID;
    /* Use 100 as a default for `ms`. */
    if (ms === void 0)
      ms = 100;

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
    var opts, select, input, dropdown, dropdownContainer,
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

