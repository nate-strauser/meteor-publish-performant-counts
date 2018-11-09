Meteor Publish Performant Counts
================================

A package to help you publish the count of a cursor in near real time.  Interval based counting suitable for very large collections and high user load.


## Counter API


```
new Counter(name, cursor, [updateInterval])
```

`name` is a string used to fetch the count of the count

`cursor` is a collection query that will be counted

`updateInterval` defaults to 10000, which will update the count every 10 seconds.


## Publish from Server


### Publish scoped counts

Counts that are specific to a user or parameter must be declared within the publish function.  This will create 1 counter for each user who subscribes.


```
Meteor.publish('countPublish', function(someValue) {
  return new Counter('countCollection', Collection.find({
  	userId:this.userId,
  	someField:someValue
  }));
});
```



### Server scoped counts


Server scoped counts that are defined outside of publish functions are more efficient that specific counts as it only creates 1 counter per server.


```
var counter = new Counter('countCollection', Collection.find({}));

Meteor.publish('countPublish', function() {
  return counter;
});
```




## Subscribe from client

Subscribe to the publication from client side code.

```
Meteor.subscribe('countPublish');
```

## Blaze Usage

Define a global helper

```
UI.registerHelper("getCount", function(name) {
	if(name)
      return Counter.get(name);
});
```


Call from within a template

```
...
{{getCount 'countCollection'}}
...
```

## Multiple Counters
In case you need multiple counters at once, you can pass multiple cursors when creating a `Counter` in the server. Each entry in the array must contain a `name` and a `cursor`.

```
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

```
Meteor.subscribe('multipleCounter');
```

and you can access this counters in two different ways:

### Get all counters as an object
If you need to access all counters at once, you can get them as an object:

```
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

```
Counter.get('multipleCounter', 'counterA');
// this will return something like this:
// 32
```

Credits
=======

Inspired by [publish-counts](https://github.com/percolatestudio/publish-counts) which is great, but does run into performance issues with large collections

Performant solution derived directly from [bullet-counter](https://github.com/bulletproof-meteor/bullet-counter/tree/solution)


License
=======
MIT
