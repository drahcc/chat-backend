'use strict'

const Schema = use('Schema')

class AddReasonToChannelBansSchema extends Schema {
  up () {
    this.table('channel_bans', (table) => {
      table.text('reason').nullable()
    })
  }

  down () {
    this.table('channel_bans', (table) => {
      table.dropColumn('reason')
    })
  }
}

module.exports = AddReasonToChannelBansSchema
