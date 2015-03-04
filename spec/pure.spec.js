var _ = require('../src/util');

describe('forEach', function() {
  beforeAll(function() {
    this.f = function(){};
    this.empty = [];
    this.singleton = [1];
    this.a = [1, 2, 3, 4, 5];
  });

  beforeEach(function() {
    spyOn(this, 'f');
  });

  it("shouldn't do anything with an empty array", function() {
    _.forEach(this.empty, this.f);
    expect(this.f).not.toHaveBeenCalled();
  });

  it('should call the function once for a singleton', function() {
    _.forEach(this.singleton, this.f);
    expect(this.f).toHaveBeenCalledWith(this.singleton[0]);
  });

  it('should call the function for each item in an array', function() {
    _.forEach(this.a, this.f);
    for (var i=0; i<this.a.length; i++) {
      expect(this.f).toHaveBeenCalledWith(this.a[i]);
    }
  });
});

describe('map', function() {
  beforeAll(function() {
    this.f = function(n) {
      return n*n;
    };
    this.empty = [];
    this.singleton = [1];
    this.a = [1, 2, 3, 4, 5];
  });

  it("shouldn't (necessarily) change the given array", function() {
    _.map(this.f, this.empty);
    expect(this.empty).toEqual([]);

    var singleton = this.singleton.slice();
    _.map(this.f, this.singleton);
    expect(this.singleton).toEqual(singleton);

    var a = this.a.slice();
    _.map(this.f, this.a);
    expect(this.a).toEqual(a);
  });

  it('should preserve length', function() {
    expect(_.map(this.f, this.empty).length).toBe(0);
    expect(_.map(this.f, this.singleton).length).toBe(1);
    expect(_.map(this.f, this.a).length).toBe(this.a.length);
  });

  it('should map', function() {
    var doubleN = function(n){return 2*n;};
    expect(_.map(doubleN, [])).toEqual([]);
    expect(_.map(doubleN, [1])).toEqual([2]);
    expect(_.map(doubleN, [1, 2, 3])).toEqual([2, 4, 6]);
  });
});

describe('filter', function() {
  beforeAll(function() {
    this.empty = [];
    this.singleton = [1];
    this.a = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    this.oddP = function(n) { return n % 2 === 1; };
  });

  it("shouldn't (necessarily change the given array", function() {
    _.filter(this.oddP, this.empty);
    expect(this.empty).toEqual([]);

    var singleton = this.singleton.slice();
    _.filter(this.oddP, this.singleton);
    expect(this.singleton).toEqual(singleton);

    var a = this.a.slice();
    _.filter(this.oddP, this.a);
    expect(this.a).toEqual(a);
  });

  it('should spit back an empty array for any predicate', function() {
    expect(_.filter(this.oddP, this.empty)).toEqual([]);
  });

  it('should give all and only items that satisfy the predicate', function() {
    expect(_.filter(this.oddP, [1, 2, 3, 4, 5])).toEqual([1, 3, 5]);
  });
});

describe('some', function() {
  beforeAll(function() {
    this.empty = [];
    this.singleton = [1];
    this.a = [1, 2, 3, 4, 5];
    this.oddP = function(n) { return n % 2 === 1; };
  });

  beforeEach(function() {
    spyOn(this, 'oddP').and.callThrough();
  });

  it('should return a boolean value', function() {
    expect(_.some(this.oddP, this.empty)).toEqual(jasmine.any(Boolean));
    expect(_.some(this.oddP, this.singleton)).toEqual(jasmine.any(Boolean));
    expect(_.some(this.oddP, this.a)).toEqual(jasmine.any(Boolean));
  });

  it('should return false for any predicate on an empty array', function() {
    expect(_.some(this.oddP, this.empty)).toBe(false);
  });

  it('should short-circuit', function() {
    _.some(this.oddP, [0, 2, 4, 5, 7, 9]);
    expect(this.oddP).toHaveBeenCalledWith(0);
    expect(this.oddP).toHaveBeenCalledWith(2);
    expect(this.oddP).toHaveBeenCalledWith(4);
    expect(this.oddP).toHaveBeenCalledWith(5);

    expect(this.oddP).not.toHaveBeenCalledWith(7);
    expect(this.oddP).not.toHaveBeenCalledWith(9);
  });

  it('should find (or not find) things properly', function() {
    expect(_.some(this.oddP, [0, 2, 4])).toBe(false);
    expect(_.some(this.oddP, [1, 3, 5])).toBe(true);
  });
});

describe('always', function() {
  it('should return a function', function() {
    var a = _.always(1);
    expect(a).toEqual(jasmine.any(Function));
  });

  it('should return `always(undefined)` when called without arguments', function() {
    expect(_.always()()).toBeUndefined();
  });

  it('should return an idempotent function', function() {
    var a = _.always('abc');
    for (var i=0; i<100; i++) {
      expect(a()).toEqual('abc');
    }
  });
});

describe('isFunction', function() {
  it('should return a Boolean', function() {
    _.forEach([void 0, null, {}, _.always(), console.log], function(o) {
      expect(_.isFunction(o)).toEqual(jasmine.any(Boolean));
    });
  });

  it('should return false for null and undefined', function() {
    expect(_.isFunction(void 0)).toBe(false);
    expect(_.isFunction(null)).toBe(false);
  });

  it('should return true for any function', function() {
    var o = {f: function(){}},
        fns = [console.log, function(){}, o.f];
    _.forEach(fns, function(f) {
      expect(_.isFunction(f)).toBe(true);
    });
  });

  it('should return false for any non-function', function() {
    var nonFns = [1, 'abc', {}, console, true, 1.5, {a: 1}, null];
    _.forEach(nonFns, function(nf) {
      expect(_.isFunction(nf)).toBe(false);
    });
  });
});

describe('merge', function() {
  it("shouldn't change an object when merged with {}", function() {
    var o1 = {},
        o2 = {};
    _.merge(o1, o2);
    expect(o1).toEqual({});

    o1 = {a: 1, b: 2};
    _.merge(o1, o2);
    expect(o1).toEqual({a: 1, b: 2});
  });

  it("shouldn't change the second object", function() {
    var o1 = {a: 1, b: 2},
        o2 = {};
    _.merge(o1, o2);
    expect(o2).toEqual({});

    o2 = {a: 1, b: 2};
    _.merge(o1, o2);
    expect(o2).toEqual({a: 1, b: 2});

    o2 = {c: {a: 1, b: 2}};
    _.merge(o1, o2);
    expect(o2).toEqual({c: {a: 1, b: 2}});
  });

  it('should do nothing if the second object is "contained" in the first', function() {
    var o1 = {a: 1, b: 2, c: 3},
        o2 = {a: 1, b: 2};
    _.merge(o1, o2);
    expect(o1).toEqual({a: 1, b: 2, c: 3});
  });

  it('should add properties that are exclusive to the second object', function() {
    var o1 = {},
        o2 = {a: 1, b: 2};
    _.merge(o1, o2);
    expect(o1).toEqual(o2);

    o1 = {a: 1};
    _.merge(o1, o2);
    expect(o1).toEqual(o2);
  });

  it('should overwrite common properties with those of the second object', function() {
    var o1 = {a: 1},
        o2 = {a: 2};
    _.merge(o1, o2);
    expect(o1).toEqual(o2);

    o1 = {a: 1, b: 2};
    _.merge(o1, o2);
    expect(o1).toEqual({a: 2, b: 2});
  });

  it('should recurse into (container-like) objects', function() {
    var o1 = {a: {aa: 1, ab: 2}},
        o2 = {a: {aa: 2, ab: 3}};
    _.merge(o1, o2);
    expect(o1).toEqual(o2);
  });

  it("shouldn't recurse into Functions", function() {
    var f1 = function(){},
        f2 = function(){},
        o1 = {f: f1},
        o2 = {f: f2};

    f1.a = 1;
    _.merge(o1, o2);
    /* Should just replace f1 with f2, instead of treating them like containers. */
    expect(o1.f.a).toBeUndefined();
  });

  it('should be "idempotent" wrt o1', function() {
    var o1 = { a: 1, b: { ba: 1, bb: 2 } },
        o2 = { a: 2, b: { ba: 2 } },
        om = { a: 2, b: { ba: 2, bb: 2 } };
    for (var i=0; i<100; i++) {
      _.merge(o1, o2);
      expect(o1).toEqual(om);
    }
  });
});

describe('search', function() {
  beforeAll(function() {
    this.q = 'ir';
    this.options = [
      { textContent: 'first' },
      { textContent: 'second' },
      { textContent: 'third' }
    ];
  });
  it('should return a [{}] with "object", "result", and "index" as fields', function() {
    var results = _.search(this.q, this.options);
    expect(results).toEqual(jasmine.any(Array));
    _.forEach(results, function(r) {
      expect(r).toEqual(jasmine.any(Object));
      expect(r.object).toBeDefined();
      expect(r.result).toBeDefined();
      expect(r.index).toBeDefined();
    });
  });

  it('should spit back an empty array', function() {
    expect(_.search(this.q, [])).toEqual([]);
  });
});

describe('maybeScrollIntoView', function() {
  beforeAll(function() {
    this.genObj = function(box) {
      return {
        getBoundingClientRect: function() { return box; },
        scrollIntoView: function(){}
      };
    };
    this.container = this.genObj({ left: 0, top: 0, right: 5, bottom: 5 });
    this.alignToTop = false;
  });

  it('should scroll if the object is bigger than its container', function() {
    var boxes = [
      { left: -1, top: 0, right: 5, bottom: 5 },
      { left: 0, top: -1, right: 5, bottom: 5 },
      { left: 0, top: 0, right: 6, bottom: 5 },
      { left: 0, top: 0, right: 5, bottom: 6 }
    ];
    _.forEach(boxes, function(box) {
      var obj = this.genObj(box);
      spyOn(obj, 'scrollIntoView');
      _.maybeScrollIntoView(obj, this.container, this.alignToTop);
      expect(obj.scrollIntoView).toHaveBeenCalledWith(this.alignToTop);
    }.bind(this));
  });

  it("shouldn't scroll if the object is at most as big as its container", function() {
    var cRect = this.container.getBoundingClientRect();
    for (var l=cRect.left; l<=cRect.right; l++) {
      for (var r=l; r<= cRect.right; r++) {
        for (var t=cRect.top; t<=cRect.bottom; t++) {
          for (var b=t; b<=cRect.bottom; b++) {
            var obj = this.genObj({ left: l, top: t, right: r, bottom: b });
            spyOn(obj, 'scrollIntoView');
            _.maybeScrollIntoView(obj, this.container, this.alignToTop);
            expect(obj.scrollIntoView).not.toHaveBeenCalled();
          }
        }
      }
    }
  });
});

