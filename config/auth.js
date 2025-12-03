'use strict'

const Env = use('Env')   // ← Това липсва

module.exports = {
  authenticator: 'jwt',

  jwt: {
    serializer: 'lucid',
    model: 'App/Models/User',
    scheme: 'jwt',
    uid: 'email',
    password: 'password',
    options: {
      secret: Env.get('APP_KEY')   // ← Вече работи
    }
  }
}
