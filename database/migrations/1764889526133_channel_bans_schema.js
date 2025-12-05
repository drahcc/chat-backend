'use strict'

const Schema = use('Schema')

class ChannelBansSchema extends Schema {
  up () {
    this.create('channel_bans', (table) => {
      table.increments()

      table.integer('channel_id')
        .unsigned()
        .references('id')
        .inTable('channels')
        .onDelete('CASCADE')

      table.integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')

      table.integer('banned_by')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')

      table.timestamps()
    })
  }

  down () {
    this.drop('channel_bans')
  }
}

module.exports = ChannelBansSchema
