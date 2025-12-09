'use strict'

const Schema = use('Schema')

class AddNotificationPreferenceToUsersSchema extends Schema {
  up () {
    this.table('users', (table) => {
      table.enum('notification_preference', ['all', 'mentions_only']).defaultTo('all')
    })
  }

  down () {
    this.table('users', (table) => {
      table.dropColumn('notification_preference')
    })
  }
}

module.exports = AddNotificationPreferenceToUsersSchema
