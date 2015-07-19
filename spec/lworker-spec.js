/* global describe */
/* global it */
/* global expect */
/* global jasmine */

describe("Simple task creation", function() {
  var leona = require('../lworker');

  it("simple task", function(done) {
    var task = leona.Task.create({
      name: 'simple-task',
      type: leona.Task.Types.Simple,
      func: function() {
        done();
      }
    });
    task.start();
  });
  
  it("async task", function(done) {
    var task = leona.Task.create({
      name: 'simple-task',
      type: leona.Task.Types.Simple,
      func: function(callback) {
        expect(callback).not.toBe(null);
        done();
      },
      opts: {
        async: true
      }
    });
    task.start();
  });
  
  it("delayed task", function(done) {
    var start = new Date().getTime();
    var task = leona.Task.create({
      name: 'simple-task',
      type: leona.Task.Types.Simple,
      func: function(callback) {
        expect(callback).not.toBe(null);
        var now = new Date().getTime();
        expect(now - start).toBeGreaterThan(1000);
        done();
      },
      opts: {
        async: true,
        delay: 1000
      }
    });
    task.start();
  });
  
  it("renews task", function(done) {
    var task = leona.Task.create({
      name: 'simple-task',
      type: leona.Task.Types.Simple,
      func: function() {
        ++this.exec;
        if (this.exec === 3) {
          done();
        }
      },
      opts: {
        data: {
          count: 0,
          exec: 0
        },
        renew: function() {
          return this.count < 3;
        },
        delay: 200
      }
    });
    task.start();
  });
});