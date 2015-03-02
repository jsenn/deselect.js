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
  it('is pending');
});

describe('some', function() {
  it('is pending');
});

describe('merge', function() {
  it('is pending');
});

describe('search', function() {
  it('is pending');
});

describe('maybeScrollIntoView', function() {
  it('is pending');
});

describe('searchList', function() {
  it('is pending');
});

describe('always', function() {
  it('should return a function', function() {
    var a = _.always(1);
    expect(a).toEqual(jasmine.any(Function));
  });

  it('should return `undefined` when called without arguments', function() {
    expect(_.always()()).toBeUndefined();
  });

  it('should return an idempotent function', function() {
    var a = _.always('abc');
    for (var i=0; i<100; i++) {
      expect(a()).toEqual('abc');
    }
  });
});

describe('merge', function() {
  it('is pending');
});

describe('KeyNavigator', function() {
  it('is pending');
});

