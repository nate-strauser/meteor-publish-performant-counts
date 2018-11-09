Counter = function (name, cursor, interval) {
  this.name = name;
  this.cursor = cursor;
  this.interval = interval || 1000 * 10;
  this._collectionName = 'counters-collection';
}

// every cursor must provide a collection name via this method
Counter.prototype._getCollectionName = function() {
  return "counter-" + this.name;
};

Counter.prototype._getMultipleCounters = function(cursors) {
  var counters = {};
  for (let i = 0; i < cursors.length; i++) {
    var currentCursor = cursors[i];
    counters[currentCursor.name] = currentCursor.cursor.count();
  }
  return counters;
}

// the api to publish
Counter.prototype._publishCursor = function(sub) {
  var self = this;

  if (Array.isArray(self.cursor)) {
    // multiple counters handled here:
    var count = self._getMultipleCounters(self.cursor);
    sub.added(self._collectionName, self.name, count);

    var handler = Meteor.setInterval(function() {
      var count = self._getMultipleCounters(self.cursor);
      sub.changed(self._collectionName, self.name, count);
    }, this.interval);

  } else {
    // single counter handled here:
    var count = self.cursor.count();
    sub.added(self._collectionName, self.name, {count: count});

    var handler = Meteor.setInterval(function() {
      var count = self.cursor.count();
      sub.changed(self._collectionName, self.name, {count: count});
    }, this.interval);
  }

  sub.onStop(function() {
    Meteor.clearTimeout(handler);
  });

  return {
    stop: sub.onStop.bind(sub)
  }
};
