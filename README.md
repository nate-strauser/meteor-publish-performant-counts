Meteor Publish Performant Counts
================================

A package to help you publish the count of a cursor in near real time.  Interval based counting suitable for very large collections and high user load.


## Counter API


```javascript
new Counter(name, cursor, [updateInterval])
```

`name` is a string used to fetch the count of the count

`cursor` is a collection query that will be counted (or a function returning a valid collection query to be counted, see [using functions to return cursors](#using-function-to-return-cursors) section below)

`updateInterval` defaults to 10000, which will update the count every 10 seconds.


## Publish from Server


### Publish scoped counts

Counts that are specific to a user or parameter must be declared within the publish function.  This will create 1 counter for each user who subscribes.


```javascript
Meteor.publish('countPublish', function(someValue) {
  return new Counter('countCollection', Collection.find({
  	userId:this.userId,
  	someField:someValue
  }));
});
```



### Server scoped counts


Server scoped counts that are defined outside of publish functions are more efficient that specific counts as it only creates 1 counter per server.


```javascript
var counter = new Counter('countCollection', Collection.find({}));

Meteor.publish('countPublish', function() {
  return counter;
});
```




## Subscribe from client

Subscribe to the publication from client side code.

```javascript
Meteor.subscribe('countPublish');
```

## Blaze Usage

Define a global helper

```javascript
UI.registerHelper("getCount", function(name) {
	if(name)
      return Counter.get(name);
});
```


Call from within a template

```javascript
...
{{getCount 'countCollection'}}
...
```

## Multiple Counters
In case you need multiple counters at once, you can pass multiple cursors when creating a `Counter` in the server. Each entry in the array must contain a `name` and a `cursor`.

```javascript
var multipleCounter = new Counter(
  'multipleCounter',
  [
    {
      name: 'counterA',
      cursor: MyCollection.find({type: 'A'})
    },
    {
      name: 'counterB',
      cursor: MyCollection.find({type: 'B'})
    }
  ]
);
Meteor.publish('multipleCounter', function() { return multipleCounter });
```

In the client, you just need to subscribe to one collection:

```javascript
Meteor.subscribe('multipleCounter');
```

and you can access this counters in two different ways:

### Get all counters as an object
If you need to access all counters at once, you can get them as an object:

```javascript
Counter.get('multipleCounter');
// this will return something like this:
// {
//   _id: "multipleCounter",
//   counterA: 32,
//   counterB: 64
// }
```

### Get one counter value directly
In case you need to access only one of your counters (i.e: in a helper), you can pass and additional param with the name of the counter:

```javascript
Counter.get('multipleCounter', 'counterA');
// this will return something like this:
// 32
```

## Using functions to return cursors
There are sometimes when you need to use dynamic values in your queries, i.e: counting records created in the last 24 hours:

```javascript
MyCollection.find({createdAt: {$gte: moment().subtract(24, 'hours').toDate(), $lte: moment().toDate()}});
```

If you just pass that query as the param to the counter, it will be evaluated on the first execution to something like:

```javascript
MyCollection.find({createdAt: {$gte: "Sat Nov 10 2018 20:23:18 GMT+0100 (CET)", $lte: "Sat Nov 11 2018 20:23:18 GMT+0100 (CET)"}});
```

and then, that same query will be used every time, returning incorrect data because that `moment().subtract(24, 'hours').toDate()` and `moment().toDate()` aren't re-evaluated.

To avoid this, you cass a function that returns that same query, like this:

```javascript
var counter = new Counter(
  'countCollection',
  function() { return Collection.find({createdAt: {$gte: moment().subtract(24, 'hours').toDate(), $lte: moment().toDate()}}); }
);

Meteor.publish('countPublish', function() {
  return counter;
});
```

In the case of multiple counter, just follow the same logic:

```javascript
var multipleCounter = new Counter(
  'multipleCounter',
  [
    {
      name: 'counterA',
      cursor: function() { return MyCollection.find({type: 'A', createdAt: {$gte: moment().subtract(24, 'hours').toDate(), $lte: moment().toDate()}}); }
    },
    {
      name: 'counterB',
      cursor: function() { return MyCollection.find({type: 'B', createdAt: {$gte: moment().subtract(24, 'hours').toDate(), $lte: moment().toDate()}}); }
    }
  ]
);
Meteor.publish('multipleCounter', function() { return multipleCounter });
```

Credits
=======

Inspired by [publish-counts](https://github.com/percolatestudio/publish-counts) which is great, but does run into performance issues with large collections

Performant solution derived directly from [bullet-counter](https://github.com/bulletproof-meteor/bullet-counter/tree/solution)


License
=======
MIT
