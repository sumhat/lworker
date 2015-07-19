if (typeof Leona === 'undefined') {
  var Leona = {};
}
  
(function() {
  function executeCallback(callback) {
    if (callback) {
      callback();
    }
  }
  
  var Condition = function(tester) {
    this.tester = tester;
  };
  
  Condition.prototype.met = function() {
    return (!!this.tester()) === true;
  };
  
  var Task = function(name, type, exec, options) {
    var self = this;
    self.name = name;
    self.type = type;
    self.exec = exec;
    self.opts = options;
    self.conditions = [];
    self.running = false;
    self.time = new Date().getTime();
    if (self.opts) {
      self.data = self.opts.data;
      if (self.opts.delay) {
        self.conditions.push(new Condition(function() {
          return (new Date()).getTime() >= self.time + self.opts.delay;
        }));
      }
      if (self.opts.condition) {
        self.conditions.push(new Condition(self.opts.condition));
      }
      if (self.opts.renew) {
        self.renew = self.opts.renew;
      }
    }
  };
  
  Task.create = function(settings) {
    return new Task(
        settings.name || 'Anonymous Task',
        settings.type || Task.Types.Simple,
        settings.func,
        settings.opts);
  }
  
  Task.parallel = function(array, settings) {
    return Task.create({
      name: 'parallel-task-generator',
      type: Task.Types.Simple,
      func: function() {
        var entry = array.shift();
        Task.create({
          name: settings.name,
          type: settings.type,
          func: settings.func,
          opts: {
            data: entry,
            delay: settings.delay,
            renew: settings.renew,
            condition: settings.condition,
            async: settings.async
          }
        }).start();
      },
      opts: {
        condition: function() {
          return array.length > 0;
        },
        renew: function() {
          return array.length > 0;
        }
      }
    });
  };
  
  Task.prototype.isReadyToRun = function() {
    var self = this;
    return self.conditions.every(function(condition) {
      return condition.met();
    });
  };
  
  Task.prototype.shouldRenew = function() {
    var self = this;
    if (self.renew === true) {
      return true;
    }
    if (typeof self.renew === 'function') {
      return (!!self.renew.call(self.data || self)) === true;
    }
    return false;
  }
  
  Task.prototype.start = function() {
    var self = this;
    if (self.running) {
      return;
    }
    self.time = new Date().getTime();
    scheduler.addTask(self);
  };
  
  Task.prototype.run = function(callback) {
    var self = this;
    self.running = true;
    
    function finishExecution() {
      self.running = false;
      executeCallback(callback);
    }
    
    setTimeout(function() {
      if (self.opts && (self.opts.async || self.opts.isAsyncExec)) {
        self.exec.call(self.data || this, finishExecution);
      } else {
        self.exec.call(self.data || this);
        finishExecution();
      }
    });
  };
  
  Task.Types = {
    'Simple': {
      'name': 'Simple',
      'qps': 1000
    },
    'Ui': {
      'name': 'Ui',
      'qps': 20
    },
    'Network': {
      'name': 'Network',
      'qps': 6
    }
  };
  
  Task.Pool = function(options) {
    var self = this;
    self.name = options.name;
    self.qps = 0;
    self.qpsLimit = options.qps || 1000;
    self.tasks = [];
    self.worker = null;
  };
  
  Task.Pool.prototype.start = function() {
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
          }, 1000);
          if (task.shouldRenew()) {
            task.start();
          }
        });
      }
      if (self.done()) {
        clearInterval(self.worker);
        self.worker = null;
      }
    }, 100);
  };
  
  Task.Pool.prototype.add = function(task) {
    var self = this;
    self.tasks.push(task);
    self.start();
  };
  
  Task.Pool.prototype.fetchReadyTask = function() {
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
  
  Task.Pool.prototype.done = function() {
    return this.tasks.length === 0;
  };
  
  Task.Scheduler = function(options) {
    var self = this;
    self.pools = {};
  };
  
  Task.Scheduler.prototype.addTask = function(task) {
    var self = this;
    
    if (!self.pools[task.type.name]) {
      var newPool = new Task.Pool(task.type);
      self.pools[task.type.name] = newPool;
    }
    self.pools[task.type.name].add(task);
  };
  
  var scheduler = new Task.Scheduler();
  
  Leona.scheduler = scheduler;
  Leona.Task = Task;
  
  if (typeof module !== 'undefined') {
    module.exports.Task = Task;
  }
})();