'use strict'

const Schema = use('Schema')

class AddIsAdminToChannelMembersSchema extends Schema {
  up () {
    this.table('channel_members', (table) => {
      table.boolean('is_admin').defaultTo(false)
    })
  }

  down () {
    this.table('channel_members', (table) => {
      table.dropColumn('is_admin')
    })
  }
}

module.exports = AddIsAdminToChannelMembersSchema
