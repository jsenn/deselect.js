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
      var badgeRect, paddingLeft, contRect, badgeHeight, contHeight;

      var badge = optionToBadge(o);
      badgeContainer.appendChild(badge);

      /* Shove the input over to make room for the new badge. */
      badgeRect = badge.getBoundingClientRect();
      paddingLeft = parseFloat(input.style.paddingLeft);
      input.style.paddingLeft = paddingLeft + badgeRect.right - badgeRect.left;

      /* Centre the badge vertically within its container. */
      badgeHeight = badgeRect.bottom - badgeRect.top;

      contRect = badgeContainer.getBoundingClientRect();
      contHeight = contRect.bottom - contRect.top;
      badge.style.top = (contHeight - badgeHeight) / 2;
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
    var searchResults;

    if (state.query.length >= 1)
      searchResults = _.search(state.query, select.children);
    else
      /* We'll display the options in the order in which they appear in the
       * <select>.
       */
      searchResults = _.map(function(o) {
        return {
          object: o,
          result: o.textContent,
          index: 0
        };
      }, select.children);

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
    if (e.keyCode !== 37 && /* left arrow key */
        e.keycode !== 39 && /* right arrow key */
        opts.keys.up.indexOf(e.keyCode)      === -1 &&
        opts.keys.select.indexOf(e.keyCode)  === -1 &&
        (opts.keys.down.indexOf(e.keyCode)   === -1 ||
         dropdown.style.display === 'none'))
      renderFromInput();
  })), false);
};

