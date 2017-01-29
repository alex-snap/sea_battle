var Utils = Utils || {};

Utils.BehaviourSubject = function (initialValue) {
  this._value = initialValue;
  this._subscribers = [];
};

Utils.BehaviourSubject.prototype.subscribe = function (cb) {
  var self = this;
  this._subscribers.push(cb);
  cb(this._value);
  return function() {
    self._subscribers.splice(self._subscribers.indexOf(cb), 1);
  };
};

Utils.BehaviourSubject.prototype.emit = function (value) {
  this._value = value;
  for (var i = 0; i < this._subscribers.length; i++) {
    this._subscribers[i].call(null, value);
  }
};