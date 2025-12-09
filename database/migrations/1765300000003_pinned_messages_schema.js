'use strict'

const Schema = use('Schema')

class PinnedMessagesSchema extends Schema {
  up () {
    this.create('pinned_messages', (table) => {
      table.increments()
      table.integer('message_id').unsigned().references('id').inTable('messages').onDelete('CASCADE')
      table.integer('channel_id').unsigned().references('id').inTable('channels').onDelete('CASCADE')
      table.integer('pinned_by').unsigned().references('id').inTable('users').onDelete('SET NULL')
      table.timestamps()
      
      // One message can only be pinned once per channel
      table.unique(['message_id', 'channel_id'])
    })
  }

  down () {
    this.drop('pinned_messages')
  }
}

module.exports = PinnedMessagesSchema
