'use strict'

const Schema = use('Schema')

class MessageReactionsSchema extends Schema {
  up () {
    this.create('message_reactions', (table) => {
      table.increments()
      table.integer('message_id').unsigned().references('id').inTable('messages').onDelete('CASCADE')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.string('emoji', 10).notNullable() // 👍❤️😂 etc
      table.timestamps()
      
      // User can only react once per emoji per message
      table.unique(['message_id', 'user_id', 'emoji'])
    })
  }

  down () {
    this.drop('message_reactions')
  }
}

module.exports = MessageReactionsSchema
