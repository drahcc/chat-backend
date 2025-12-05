'use strict'

const Schema = use('Schema')

class ChannelMembersSchema extends Schema {
  up () {
    this.create('channel_members', (table) => {
      table.increments()

      table
        .integer('channel_id')
        .unsigned()
        .references('id')
        .inTable('channels')
        .onDelete('CASCADE')

      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')

      // channel admin
      table.boolean('is_admin').defaultTo(false)

      // pinned (използва се за нова покана)
      table.boolean('is_pinned').defaultTo(false)

      table.timestamps()

      table.unique(['channel_id', 'user_id'])
    })
  }

  down () {
    this.drop('channel_members')
  }
}

module.exports = ChannelMembersSchema
