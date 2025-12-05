'use strict'

/** @type {import('@adonisjs/framework/src/Env')} */
const Env = use('Env')

module.exports = {

  /*
  |--------------------------------------------------------------------------
  | Application Name
  |--------------------------------------------------------------------------
  */
  name: Env.get('APP_NAME', 'AdonisJs'),

  /*
  |--------------------------------------------------------------------------
  | App Key
  |--------------------------------------------------------------------------
  |
  | This key is used to encrypt cookies, sessions and other sensitive data.
  */
  appKey: Env.getOrFail('APP_KEY'),

  /*
  |--------------------------------------------------------------------------
  | HTTP Settings
  |--------------------------------------------------------------------------
  */
  http: {
    allowMethodSpoofing: true,
    trustProxy: false,
    subdomainOffset: 2,
    jsonpCallback: 'callback',
    etag: false
  },

  /*
  |--------------------------------------------------------------------------
  | View Settings
  |--------------------------------------------------------------------------
  */
  views: {
    cache: Env.get('CACHE_VIEWS', false)
  },

  /*
  |--------------------------------------------------------------------------
  | Static Assets
  |--------------------------------------------------------------------------
  */
  static: {
    dotfiles: 'ignore',
    etag: true,
    extensions: false
  },

  /*
  |--------------------------------------------------------------------------
  | Localization Settings
  |--------------------------------------------------------------------------
  */
  locales: {
    loader: 'file',
    locale: 'en'
  },

  /*
  |--------------------------------------------------------------------------
  | Debug Mode (ENABLED)
  |--------------------------------------------------------------------------
  |
  | Shows detailed stack trace when errors occur.
  */
  debug: true,

  /*
  |--------------------------------------------------------------------------
  | Logger Settings
  |--------------------------------------------------------------------------
  */
  logger: {
    transport: 'console',

    console: {
      driver: 'console',
      name: 'adonis-app',
      level: 'info'
    },

    file: {
      driver: 'file',
      name: 'adonis-app',
      filename: 'adonis.log',
      level: 'info'
    }
  },

  /*
  |--------------------------------------------------------------------------
  | Cookie Settings
  |--------------------------------------------------------------------------
  */
  cookie: {
    httpOnly: true,
    sameSite: false,
    path: '/',
    maxAge: 7200
  }
}
