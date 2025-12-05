'use strict'

const { Ignitor } = require('@adonisjs/ignitor')

new Ignitor(require('@adonisjs/fold'))
  .appRoot(__dirname)
  .wsServer()       // <<< ВАЖНО – това стартира WebSocket сървъра
  .fireHttpServer()
  .catch(console.error)
