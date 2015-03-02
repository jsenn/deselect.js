var _ = require('../src/util');

describe('highlightString', function() {
  beforeAll(function() {
    this.s = 'a normal string';
    this.opts = {
      class: 'class1 class2'
    };
  });
  it('should give the same string if the start and end are the same', function() {
    for (var i=0; i<this.s.length; i++) {
      expect(_.highlightString(this.s, i, i, this.opts)).toBe(this.s);
    }
  });

  it('should give another string for all 0 <= start < end <= s.length', function() {
    for (var end=1; end<=this.s.length; end++) {
      for (var start=0; start<end; start++) {
        var hl = _.highlightString(this.s, start, end, this.opts);
        expect(hl).not.toBe(this.s); /* since start !== end */
        expect(hl).toEqual(jasmine.any(String));
      }
    }
  });
});

describe('hasAncestor', function() {
  it('is pending');
});

describe('addClass', function() {
  it('is pending');
});

describe('removeClass', function() {
  it('is pending');
});

describe('previousElementSibling', function() {
  it('is pending');
});

describe('nextElementSibling', function() {
  it('is pending');
});

describe('firstElementChild', function() {
  it('is pending');
});

describe('lastElementChild', function() {
  it('is pending');
});

