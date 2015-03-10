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

