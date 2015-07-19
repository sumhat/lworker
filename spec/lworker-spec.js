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
});