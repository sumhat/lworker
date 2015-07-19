# Leona Worker
A task scheduler for Javascript.

## Api:
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
