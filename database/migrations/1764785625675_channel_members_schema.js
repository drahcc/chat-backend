'use strict'

const Schema = use('Schema')

class ChannelMembersSchema extends Schema {
  up () {
    this.create('channel_members', (table) => {
      table.increments()

      table.integer('channel_id').unsigned().references('id').inTable('channels').onDelete('CASCADE')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')

      // unique constraint: един потребител не може да членува 2 пъти
      table.unique(['channel_id', 'user_id'])

      table.timestamps()
    })
  }

  down () {
    this.drop('channel_members')
  }
}

module.exports = ChannelMembersSchema
