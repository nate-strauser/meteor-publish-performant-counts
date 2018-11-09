Counter = {};
Counter.collection = new Meteor.Collection('counters-collection');

Counter.get = function(name, subname) {
  var doc = Counter.collection.findOne(name);
  if(doc) {
    if (subname) return doc[subname];
    return (doc.hasOwnProperty('count')) ? doc.count : doc;
  } else {
    return 0;
  }
};
