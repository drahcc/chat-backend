'use strict'

const Schema = use('Schema')

class UsersSchema extends Schema {
  up () {
    this.create('users', (table) => {
      table.increments()
      table.string('username', 80).notNullable().unique()
      table.string('email', 254).notNullable().unique()
      table.string('password', 60).notNullable()

      // EXTRA FIELDS
      table.string('first_name').nullable()
      table.string('last_name').nullable()
      table.string('avatar_url').nullable()

      table.timestamps()
    })
  }

  down () {
    this.drop('users')
  }
}

module.exports = UsersSchema
