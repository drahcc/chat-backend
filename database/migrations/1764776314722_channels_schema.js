'use strict'

const Schema = use('Schema')

class ChannelsSchema extends Schema {
  up () {
    this.create('channels', (table) => {
      table.increments()

      table.string('name').notNullable().unique()
      table.enu('type', ['public', 'private']).defaultTo('public')

      // admin (owner)
      table
        .integer('admin_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')

      table.text('description').nullable()

      // auto cleanup after 30 days inactivity
      table.timestamp('last_message_at').nullable()

      table.timestamps()
    })
  }

  down () {
    this.drop('channels')
  }
}

module.exports = ChannelsSchema
