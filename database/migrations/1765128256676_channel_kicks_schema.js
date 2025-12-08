'use strict'

const Schema = use('Schema')

class ChannelKicksSchema extends Schema {
  up () {
    this.create('channel_kicks', (table) => {
      table.increments()
      table.integer('channel_id').unsigned().references('id').inTable('channels').onDelete('CASCADE')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.integer('kicked_by').unsigned().references('id').inTable('users').onDelete('SET NULL')
      table.timestamp('created_at').defaultTo(this.fn.now())
    })
  }

  down () {
    this.drop('channel_kicks')
  }
}

module.exports = ChannelKicksSchema
