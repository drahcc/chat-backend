'use strict'

module.exports = {
  csrf: {
    enable: false,
    methods: ['POST', 'PUT', 'PATCH', 'DELETE'],
    filterUris: [],
  },

  csp: {
    enable: false,
    directives: {},
  },

  xss: {
    enable: true,
    filterUri: false,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  },

  nosniff: true,
  frameguard: true,
  hsts: false
}
