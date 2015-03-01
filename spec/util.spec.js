var _ = require('../src/util');

describe('map', function() {
  beforeAll(function() {
    this.f = function(n) {
      return n*n;
    };
    this.empty = [];
    this.singleton = [1];
    this.a = [1, 2, 3, 4, 5];
  });

  it("shouldn't change the given array", function() {
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

