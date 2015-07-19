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
