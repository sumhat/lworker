# Leona Worker
A task scheduler for Javascript.

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
