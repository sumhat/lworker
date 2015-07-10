/* global Leona */

(function() {
  if (typeof Leona === 'undefined') {
    Leona = {};
  }
  
  if (!Leona.Util) {
    Leona.Util = {};
  }
  
  Leona.Util.Condition = function(tester) {
    this.tester = tester;
  };
  
  Leona.Util.Condition.prototype.met = function() {
    return (!!this.tester()) === true;
  };
  
  Leona.Util.Task = function(name, type, exec, options) {
    var self = this;
    self.name = name;
    self.type = type;
    self.exec = exec;
    self.opts = options;
    self.conditions = [];
    if (self.opts) {
      if (self.opts.delay) {
        var notRunUntil = new Date().getTime() + self.opts.delay;
        self.conditions.push(new Leona.Util.Condition(function() {
          return (new Date()).getTime() >= notRunUntil;
        }));
      }
      if (self.opts.condition) {
        self.conditions.push(new Leona.Util.Condition(self.opts.condition));
      }
      if (self.opts.renew) {
        self.renew = self.opts.renew;
      }
    }
  };
  
  Leona.Util.Task.prototype.isReadyToRun = function() {
    var self = this;
    return self.conditions.every(function(condition) {
      return condition.met();
    });
  };
  
  Leona.Util.Task.prototype.shouldRenew = function() {
    if (self.renew === true) {
      return true;
    }
    if (typeof self.renew === 'function') {
      return (!!self.renew()) === true;
    }
    return false;
  }
  
  Leona.Util.Task.prototype.run = function(callback) {
    var self = this;
    if (self.opts.isAsyncExec) {
      self.exec(callback);
    } else {
      self.exec();
      if (callback) {
        callback();
      }
    }
  };
  
  Leona.Util.Task.Types = {
    'Simple': {
      'name': 'Simple',
      'qps': 1000
    },
    'Ui': {
      'name': 'Ui',
      'qps': 7
    },
    'Network': {
      'name': 'Network',
      'qps': 4
    }
  };
  
  Leona.Util.Task.Pool = function(options) {
    var self = this;
    self.qps = 0;
    self.qpsLimit = options.qps || 1000;
    self.tasks = [];
    self.worker = null;
  };
  
  Leona.Util.Task.Pool.prototype.start = function() {
    var self = this;
    if (self.worker) {
      return;
    }
    self.worker = setInterval(function() {
      if (self.qps >= self.qpsLimit) {
        return;
      }
      var task = self.fetchReadyTask();
      if (task) {
        ++self.qps;
        task.run(function() {
          setTimeout(function() {
            --self.qps;
            if (task.shouldRenew()) {
              self.add(task);
            }
          }, 1000);
        });
      }
      if (self.done()) {
        clearInterval(self.worker);
        self.worker = null;
      }
    }, 100);
  };
  
  Leona.Util.Task.Pool.prototype.add = function(task) {
    var self = this;
    self.tasks.push(task);
    self.start();
  };
  
  Leona.Util.Task.Pool.prototype.fetchReadyTask = function() {
    var self = this;
    var taskCount = self.tasks.length;
    var task = null;
    for (var i = 0; i < taskCount; ++i) {
      if (self.tasks[i].isReadyToRun()) {
        task = self.tasks[i];
        self.tasks.splice(i, 1);
        break;
      }
    }
    return task;
  };
  
  Leona.Util.Task.Pool.prototype.done = function() {
    return this.tasks.length === 0;
  };
  
  Leona.Util.Task.Scheduler = function(options) {
    var self = this;
    self.pools = {};
  };
  
  Leona.Util.Task.Scheduler.prototype.addTask = function(task) {
    var self = this;
    
    if (!self.pools[task.type.name]) {
      var newPool = new Leona.Util.Task.Pool(task.type);
      self.pools[task.type.name] = newPool;
    }
    self.pools[task.type.name].add(task);
  };
  
  Leona.Util.Task.Scheduler.prototype.add = function(task) {
    var self = this;
    if (task instanceof Leona.Util.Task) {
      self.addTask(task);
    } else {
      self.addTask(new Leona.Util.Task(
        task.name || 'Anonymous Task',
        task.type || Leona.Util.Task.Types.Simple,
        task.func,
        task.opts
      ));
    }
  };
  
  Leona.scheduler = new Leona.Util.Task.Scheduler();
})();