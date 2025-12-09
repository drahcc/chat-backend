'use strict'

const Model = use('Model')
const Hash = use('Hash')

class User extends Model {
  static boot() {
    super.boot()

    this.addHook('beforeSave', async (userInstance) => {
      if (userInstance.password) {
        userInstance.password = await Hash.make(userInstance.password)
      }
    })
  }

  static get hidden() {
    return ['password']
  }

  static get fillable() {
    return ['username', 'email', 'password', 'first_name', 'last_name', 'avatar_url', 'status']
  }
}

module.exports = User
