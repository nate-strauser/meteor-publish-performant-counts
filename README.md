Meteor Publish Performant Counts
================================

A package to help you publish the count of a cursor in near real time.  Interval based counting suitable for very large collections and high user load.



##Publish from server

Be sure to define counters outside of publish function so there is only 1 instance per server.  If done inside the publish function, it would be 1 counter per subscription/user.

```
new Counter(name, cursor, [updateInterval])
```

`updateInterval` defaults to 10000, which will update the count every 10 seconds.


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

Credits
=======

Inspired by [publish-counts](https://github.com/percolatestudio/publish-counts) which is great, but does run into performance issues with large collections

Performant solution derived directly from [bullet-counter](https://github.com/bulletproof-meteor/bullet-counter/tree/solution)


License
=======
MIT