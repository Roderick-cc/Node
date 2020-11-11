var Collection = require('../')
  , assert = require('assert')
  , Emitter = require('events').EventEmitter
  , Model = require('merstone')

describe('model', function () {

  describe('new Collection()', function () {

    it('should create a new collection', function () {
      var c = new Collection()
      assert(c instanceof Collection)
    })

    it('should default models to empty array', function () {
      var c = new Collection({})
      assert.deepEqual(c.models, [])
    })

    it('should be an event emitter', function () {
      var m = new Collection({})
      assert(m instanceof Emitter)
    })

  })

  describe('add()', function () {

    it('should add an item to the array of models', function () {

      var c = new Collection({})
        , model = new Model({}, { _id: '1' })
      c.add(model)
      assert.equal(1, c.models.length)
      assert.equal(model, c.get('1'))

    })

    it('should emit an add event with the model just added', function (done) {

      var c = new Collection({})
        , model = new Model({}, { _id: '1' })

      c.on('add', function (m) {
        assert.equal(model, m)
        done()
      })

      c.add(model)

    })

    it('should not add a duplicate item', function () {

      var c = new Collection({})
      assert.equal(0, c.models.length)
      c.add(new Model({}, { _id: '1' }))
      assert.equal(1, c.models.length)
      c.add(new Model({}, { _id: '1' }))
      assert.equal(1, c.models.length)
      var m1 = new Model({}, { _id: null })
      m1.cid = '1'
      c.add(m1)
      assert.equal(1, c.models.length)
      var m2 = new Model({}, { _id: null })
      m2.cid = 'c1'
      c.add(m2)
      assert.equal(2, c.models.length)
      var m3 = new Model({}, { _id: null })
      m3.cid = 'c1'
      c.add(m3)
      assert.equal(2, c.models.length)
      c.add(new Model({}, { _id: 'c1' }))
      assert.equal(2, c.models.length)

    })

    it('should return true if an item was added', function () {
      var c = new Collection({})
      assert.equal(true, c.add(new Model({}, { _id: '1' })))
    })

    it('should return true if an item was added', function () {
      var c = new Collection({})
      c.add(new Model({}, { _id: '1' }))
      assert.equal(null, c.add(new Model({}, { _id: '1' })))
    })

  })

  describe('remove()', function () {

    it('should remove an item with matching id/cid and return it', function () {
      var c = new Collection({})
        , model = new Model({}, { _id: '1' })
      c.add(model)
      assert.equal(model, c.remove('1'))
      assert.equal(0, c.models.length)
    })

    it('should return null if no id was given', function () {
      var c = new Collection({})
      assert.equal(null, c.remove())
    })

    it('should return null if it can’t match the id/cid', function () {
      var c = new Collection({})
      c.add(new Model({}, { _id: '1' }))
      assert.equal(null, c.remove('a'))
    })

    it('should emit a remove event with the model just removed', function (done) {
      var c = new Collection({})
        , model = new Model({}, { _id: '1' })
      c.on('remove', function (m) {
        assert.equal(model, m)
        done()
      })
      c.add(model)
      c.remove('1')
    })

  })

  describe('get()', function () {

    it('should find an item with matching id/cid and return it', function () {
      var c = new Collection({})
        , model = new Model({}, { _id: '1' })
      c.add(model)
      assert.equal(model, c.get('1'))
    })

    it('should return null if no id was given', function () {
      var c = new Collection({})
      assert.equal(null, c.get())
    })

    it('should return null if it can’t match the id/cid', function () {
      var c = new Collection({})
      c.add(new Model({}, { _id: '1' }))
      assert.equal(null, c.get('a'))
    })

  })

  describe('reset()', function () {

    it('should default to an empty array', function () {
      var c = new Collection({})
      c.add(new Model({}, { _id: '1' }))
      c.reset()
      assert.deepEqual([], c.models)
    })

    it('should emit a reset event with the new set of models and the previous models', function (done) {
      var previousModels = [ new Model({}, { _id: '123' } ) ]
        , c = new Collection({}, previousModels)
        , models = [ new Model({}, { _id: '1' }), new Model({}, { _id: '2' }) ]
      c.on('reset', function (ms, prevs) {
        assert.equal(models, ms)
        assert.equal(c.models, ms)
        assert.equal(previousModels, prevs)
        done()
      })
      c.reset(models)
    })

  })

  describe('toJSON()', function () {

    it('should clone items or call their toJSON() method', function () {
      var c = new Collection({})
      c.add(new Model({}, { _id: '1', a: 10, b: 20 }))
      c.add(new Model({}))
      c.models[1].toJSON = function () { return 'json!' }
      var json = c.toJSON()
      assert.deepEqual([ { _id: '1', a: 10, b: 20 }, 'json!' ], json)
      // Ensure the data was cloned by updating the 'json'
      // and checking it didn't affect the models
      json[0].a += 10
      assert.equal(10, c.models[0].attributes.a)
    })

  })

  describe('model event propagation', function () {

    it('should propagate "change" events by default', function (done) {

      var m = new Model()
        , c = new Collection({}, [ m ])

      c.on('model:change', function (model) {
        assert.equal(m, model)
        done()
      })

      m.set('a', 10)

    })

    it('should propagate "reset" events by default', function (done) {

      var m = new Model({})
        , c = new Collection({}, [ m ])

      c.on('model:reset', function (model) {
        assert.equal(m, model)
        done()
      })

      m.reset()

    })

    it('should stop propagating events on a model that is removed', function (done) {

      setTimeout(done, 10)

      var m = new Model({})
        , c = new Collection({}, [ m ])

      c.on('model:change', function () {
        done(new Error('should not be called'))
      })

      c.remove(m.cid)
      m.set('a', 10)

    })

    it('should propagate events models added with add()', function (done) {

      var m = new Model()
        , c = new Collection({})

      c.on('model:change', function (model) {
        assert.equal(m, model)
        done()
      })

      c.add(m)
      m.set('a', 10)

    })

    it('should stop propagating events on old models when reset() is called', function (done) {

      setTimeout(done, 10)

      var m = new Model({})
        , c = new Collection({}, [ m ])

      c.on('model:change', function () {
        done(new Error('should not be called'))
      })

      c.reset()
      m.set('a', 10)

    })

    it('should start propagating events on new models when reset() is called', function (done) {

      var m = new Model({})
        , c = new Collection({}, [])

      c.on('model:change', function () {
        done()
      })

      c.reset([ m ])
      m.set('a', 10)

    })

    it('should propagate additional events given in the constructor', function (done) {

      var m = new Model({})
        , c = new Collection({}, [ m ], [ 'flop' ])

      c.on('model:flop', function (model) {
        assert.equal(model, m)
        done()
      })

      m.emit('flop')

    })

  })

  describe('at()', function () {

    it('should retrieve a model at the given index', function () {
      var m = new Model({}, { a: 20 })
        , c = new Collection({}, [ new Model({}, { a: 10 }), m ])
      assert.equal(m, c.at(1))
    })

    it('should return undefined if a model does not exist at the given index', function () {
      var c = new Collection({})
      assert.equal(undefined, c.at(2))
    })

  })

  describe('array methods', function () {

    it('should expose array methods on the collection object', function () {

      var c = new Collection({}, [ new Model({}, { a: 10 }), new Model({}, { a: 20 }) ])
      assert.deepEqual([ 10, 20 ], c.map(function (m) { return m.get('a') }))
      assert.deepEqual(30, c.reduce(function (prev, m) { return prev + m.get('a') }, 0))
      assert.deepEqual([ c.models[0] ], c.filter(function (m) { return m.get('a') === 10 }))

    })

  })

  describe('.length property', function () {

    it('should reflect the currenty length of the collection’s models array', function () {
      var c = new Collection({}, [ new Model({}, { a: 10 }), new Model({}, { a: 20 }) ])
      assert.equal(2, c.length)
      c.add(new Model({}, { a: 30 }))
      assert.equal(3, c.length)
      c.reset()
      assert.equal(0, c.length)
    })

  })

})
