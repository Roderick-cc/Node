module.exports = Collection

var EventEmitter = require('events').EventEmitter
  , clone = require('lodash.clonedeep')

function Collection(serviceLocator, models, propagatedModelEvents) {
  EventEmitter.apply(this)
  this.serviceLocator = serviceLocator
  this.models = models || []
  this.propagatedModelEvents = propagatedModelEvents || [ 'change', 'reset' ]
  this._boundEvents = []
  this.models.forEach(this._startModelEventPropagation.bind(this))
}

// Inherit from event emitter
Collection.prototype = Object.create(EventEmitter.prototype)

Collection.prototype.add = function (model) {
  // Don't allow duplicated cids or ids
  if (this.get(model.cid)) return null
  if (model.id && this.get(model.id)) return null
  this.models.push(model)
  this._startModelEventPropagation(model)
  this.emit('add', model)
  return true
}

Collection.prototype.remove = function (id) {
  if (!id) return null
  var toDelete, index
  this.models.some(function (model, i) {
    if (model.id === id || model.cid === id) {
      toDelete = model
      index = i
      return true
    }
  })
  if (!toDelete) return null
  this.models.splice(index, 1)
  this._stopModelEventPropagation(toDelete)
  this.emit('remove', toDelete)
  return toDelete
}

Collection.prototype.reset = function (models) {
  if (!models) models = []
  var previousModels = this.models
  this.models.forEach(this._stopModelEventPropagation.bind(this))
  this.models = models
  this.models.forEach(this._startModelEventPropagation.bind(this))
  this.emit('reset', models, previousModels)
}

Collection.prototype.get = function (id) {
  if (!id) return null
  var model
  this.models.some(function (m) {
    if (m.id === id || m.cid === id) {
      model = m
      return true
    }
  })
  if (!model) return null
  return model
}

Collection.prototype.at = function (i) {
  return this.models[i]
}

Collection.prototype.toJSON = function () {
  return this.models.map(function (model) {
    return typeof model.toJSON === 'function' ? model.toJSON() : clone(model)
  })
}

Collection.prototype._startModelEventPropagation = function (model) {
  // Propagate the desired events
  this.propagatedModelEvents.forEach(function (event) {
    var listener = { target: model, event: event, fn: this.emit.bind(this, 'model:' + event, model) }
    this._boundEvents.push(listener)
    model.on(event, listener.fn)
  }.bind(this))
}

Collection.prototype._stopModelEventPropagation = function (model) {
  // Unbind the model's events that were propagated
  this._boundEvents
    .filter(function (listener) { return listener.target === model })
    .forEach(function (listener) {
      model.removeListener(listener.event, listener.fn)
    })
  this._boundEvents = this._boundEvents.filter(function (listener) { return listener.target !== model })
}

var arrayFns =

  // Iterators
  [ 'forEach'
  , 'map'
  , 'filter'
  , 'reduce'
  , 'reduceRight'
  , 'every'
  , 'some'

  // Accessors
  , 'concat'
  , 'slice'

  ]

// Hoist non-mutatey array functions on to the collection
// class that work on the collection.models array
arrayFns.forEach(function (name) {
  Collection.prototype[name] = function () {
    return this.models[name].apply(this.models, arguments)
  }
})

Object.defineProperty(Collection.prototype, 'length', { get: function () { return this.models.length } })
