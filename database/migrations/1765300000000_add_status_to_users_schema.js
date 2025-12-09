'use strict'

const Schema = use('Schema')

class AddStatusToUsersSchema extends Schema {
  up () {
    this.table('users', (table) => {
      table.enu('status', ['online', 'dnd', 'offline']).defaultTo('offline')
      table.timestamp('last_seen').nullable()
    })
  }

  down () {
    this.table('users', (table) => {
      table.dropColumn('status')
      table.dropColumn('last_seen')
    })
  }
}

module.exports = AddStatusToUsersSchema
