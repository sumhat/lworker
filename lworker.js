/* global Leona */

(function() {
  if (typeof Leona === 'undefined') {
    Leona = {};
  }
  
  if (!Leona.Util) {
    Leona.Util = {};
  }
  
  Leona.Util.Task = function(name, type, exec, options) {
    var self = this;
    self.name = name;
    self.type = type;
    self.exec = exec;
    self.opts = options;
    if (self.opts.delay) {
      self.notRunUntil = new Date().getTime() + self.opts.delay;
    }
  };
  
  Leona.Util.Task.prototype.isReadyToRun = function() {
    var self = this;
    return !self.notRunUntil || (new Date()).getTime() <= self.notRunUntil;
  };
  
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
      'qps': 2
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
    self.worker = setInterval(function() {
      if (self.qps >= self.qpsLimit) {
        return;
      }
      ++self.qps;
      var task = self.fetchReadyTask();
      if (task) {
        task.run(function() {
          setTimeout(function() {
            --self.qps;
          }, 1000);
        });
      }
    }, 100);
  };
  
  Leona.Util.Task.Pool.prototype.add = function(task) {
    var self = this;
    self.tasks.push(task);
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
  
  Leona.Util.Task.Scheduler = function(options) {
    var self = this;
    self.pools = {};
  };
  
  Leona.Util.Task.Scheduler.prototype.addTask = function(task) {
    var self = this;
    
    if (!self.pools[task.type.name]) {
      var newPool = new Leona.Util.Task.Pool(task.type);
      newPool.start();
      self.pools[task.type.name] = newPool;
    }
    self.pools[task.type.name].add(task);
  };
  
  Leona.Util.Task.Scheduler.prototype.add = function(task) {
    var self = this;
    if (task instanceof Leona.Util.Task) {
      self.addTask(task);
    } else {
      var taskObj = new Leona.Util.Task('Anonymous Task', Leona.Util.Task.Types.Local, task);
      self.addTask(taskObj);
    }
  };
})();