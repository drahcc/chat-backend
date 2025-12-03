'use strict'

const Env = use('Env')

module.exports = {

  /*
  |--------------------------------------------------------------------------
  | Default authenticator
  |--------------------------------------------------------------------------
  |
  | Default method for authentication
  |
  */
  authenticator: 'jwt',

  /*
  |--------------------------------------------------------------------------
  | JWT Authenticator
  |--------------------------------------------------------------------------
  */
  jwt: {
    serializer: 'lucid', // Use the User model
    model: 'App/Models/User',
    scheme: 'jwt',
    uid: 'email',
    password: 'password',
    
    options: {
      secret: Env.get('APP_KEY') || 'SUPER_SECRET_KEY_CHANGE_THIS'
    }
  }
}
