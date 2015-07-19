# Leona Worker
A task scheduler for Javascript.

[![Build Status via Travis CI](https://travis-ci.org/sumhat/lworker.svg?branch=master)](https://travis-ci.org/sumhat/lworker)
[![Coverage Status](https://coveralls.io/repos/sumhat/lworker/badge.svg?branch=master&service=github)](https://coveralls.io/github/sumhat/lworker?branch=master)

## Features
* QPS restriction on different type of task
* Able to rerun a task immediately or on demand after it finishes.

## Api
Task defination:
```javascript
{
  name: 'any string',
  type: Leona.Task.Types.Simple, // or others in Types
  func: function() {
    // actual code to run
  },
  opts: {
    delay: 1000, // millisec to be dalayed for tast execution
    async: true, // if true, func must accepts a callback parameter for async callback
    condition: function() {
      return true; // task to be execution until condition is met
    },
    renew: function() {
      return false; // should task to be repeated?
    }
  }
}
```

## Examples
Create a task:

```javascript
var task = Leona.Task.create({
  name: 'simple-task',
  type: Leona.Task.Types.Simple,
  func: function() {
    console.log('Hello World');
  }
});
```

Execute a task:

```javascript
task.start();
```

Delay task execution:

```javascript
var task = Leona.Task.create({
  name: 'simple-task',
  type: Leona.Task.Types.Simple,
  func: function() {
    console.log('Hello World');
  },
  opts: {
    delay: 1000 // 1 second
  }
});
```

Repeat task execution:

```javascript
var task = Leona.Task.create({
  name: 'simple-task',
  type: Leona.Task.Types.Simple,
  func: function() {
    console.log('Hello World');
  },
  opts: {
    renew: function() {
      return true; // repeat task after it finishes.
    }
  }
});
```

Retry on fail:

```javascript
Leona.Task.create({
  name: 'retry',
  type: Leona.Task.Types.Network,
  func: function(callback) {
    var self = this;
    $.ajax({
      error: function(xhr, textStatus, errorThrown ) {
        self.tryCount++;
      },
      success: function(data, textStatus, xhr) {
        self.retry = 0; // Stop retrying
        callback();
      }
    });
  },
  opts: {
    data: {  // Will be passed into func and renew as 'this'.
      retry = 3,
      tryCount = 0
    },
    async: true,
    renew: function() {
      return this.tryCount < this.retry;
    }
  }
});
```
