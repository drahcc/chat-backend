'use strict'

module.exports = {
  origin: true, //🔥 позволява ВСИЧКО (localhost:9000 включително)

  methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],

  headers: true,

  exposeHeaders: false,

  credentials: false,

  maxAge: 90
}
