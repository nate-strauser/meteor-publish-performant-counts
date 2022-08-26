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

// the api to publish
Counter.prototype._publishCursor = function(sub) {
  var self = this;
  var lastCount = self.cursor.count();
  sub.added(self._collectionName, self.name, {count: lastCount});

  var handler = Meteor.setInterval(function() {
    var count = self.cursor.count();
    if (count !== lastCount) {
      lastCount = count;
      sub.changed(self._collectionName, self.name, {count: count});
    }
  }, this.interval);

  sub.onStop(function() {
    Meteor.clearTimeout(handler);
  });

  return {
    stop: sub.onStop.bind(sub)
  }
};

