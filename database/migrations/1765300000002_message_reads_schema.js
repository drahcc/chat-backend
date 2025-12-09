'use strict'

const Schema = use('Schema')

class MessageReadsSchema extends Schema {
  up () {
    this.create('message_reads', (table) => {
      table.increments()
      table.integer('message_id').unsigned().references('id').inTable('messages').onDelete('CASCADE')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.timestamp('read_at').defaultTo(this.fn.now())
      table.timestamps()
      
      // User can mark message as read only once
      table.unique(['message_id', 'user_id'])
    })
  }

  down () {
    this.drop('message_reads')
  }
}

module.exports = MessageReadsSchema
