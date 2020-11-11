# Chale

[![NPM](https://nodei.co/npm/chale.png?compact=true)](https://nodei.co/npm/chale/)

<!-- [![Build Status](https://travis-ci.org/bengourley/chale.svg)](https://travis-ci.org/bengourley/chale) -->

This is a base class for managing a collection of models. It's designed to be used with
[Merstone models](https://github.com/bengourley/merstone) models, but the only opiniated
piece of design is that the models it works with must have an `id` and a `cid` property
and be an [event emitter](http://nodejs.org/api/events.html#events_class_events_eventemitter).

If you are used to Backbone, throw your notion of collections out of the window. In my opinion,
Backbone Collections couple the two very distinct roles of a) managing a collection of models
in an interface and b) the CRUD actions of entities over a RESTy AJAX API. Chale collections just
deal with a) and I prefer to use a service for persistence.

Chale collections inherit their eventy behaviour from node [event emitter](http://nodejs.org/api/events.html#events_class_events_eventemitter).

## Browser support

If you need IE8 support you need to include [es5-shim](https://github.com/es-shims/es5-shim/blob/master/es5-shim.js)
and [es5-sham](https://github.com/es-shims/es5-shim/blob/master/es5-sham.js) to polyfill the ES5 features that this module uses.

## Installation

```
npm install --save chale
```

## Usage

```js
//
// Constructor
//

var Collection = require('chale')
  , Model = require('merstone')
  , c = new Collection(serviceLocator, {})

//
// Adding, getting and removing
//

c.add(new Model(serviceLocator, { _id: '123' }))
c.get('123')
c.remove('123')
c.reset([ new Model(serviceLocator, { _id: '234' }), new Model(serviceLocator, { _id: '345' }) ])
c.at(5) // Retrieves model at the given index

// Array methods
// The following array methods are copied onto the Collection prototype.
// These work on the collection.models array:

c.forEach(…)
c.map(…)
c.filter(…)
c.reduce(…)
c.reduceRight(…)
c.every(…)
c.some(…)
c.concat(…)
c.slice(…)

// Length property
c.length

//
// Events
//

c.on('add', function (model) {
  console.log('A model was added: id=' + model.id)
})

c.on('remove', function (model) {
  console.log('A model was removed: id=' + model.id)
})

c.on('reset', function (models) {
  console.log('The collection was reset with ' + models.length + ' models')
})

//
// Propagating model events
//

// By default 'change' and 'reset' events are propagated from models
c.on('model:change', function (model) {})
c.on('model:reset', function (model) {})

// Propagate more events by telling the
// constructor what you want to listen to
var c = new Collection({}, [], [ 'change', 'reset', 'flip', 'flop' ])
c.on('model:flip', function (model, …) {})

//
// Serialisation
//

// Creates a deep clone of the collection's models
c.toJSON()
```

## The name?
I've made a bunch of MVC-like components. I named each one after villages on the
[Isle of Wight](http://en.wikipedia.org/wiki/Isle_of_Wight) (where I live) beginning
with the same letter as the thing it represents.

See also [Ventnor views](https://github.com/bengourley/ventnor) and
[Merstone models](https://github.com/bengourley/merstone).

## Credits
* [Ben Gourley](https://github.com/bengourley/)

## Licence
Copyright (c) 2014, Ben Gourley

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
