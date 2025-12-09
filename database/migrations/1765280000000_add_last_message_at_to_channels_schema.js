'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddLastMessageAtToChannelsSchema extends Schema {
  up () {
    this.table('channels', (table) => {
      table.timestamp('last_message_at').nullable()
    })
  }

  down () {
    this.table('channels', (table) => {
      table.dropColumn('last_message_at')
    })
  }
}

module.exports = AddLastMessageAtToChannelsSchema
