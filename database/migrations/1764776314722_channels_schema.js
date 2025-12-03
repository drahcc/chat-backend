'use strict'

const Schema = use('Schema')

class ChannelsSchema extends Schema {
  up () {
    this.create('channels', (table) => {
      table.increments()
      table.string('name').notNullable().unique()
      table.enu('type', ['public', 'private']).defaultTo('public')

      // Това липсваше!
      table
        .integer('owner_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')

      table.timestamps()
    })
  }

  down () {
    this.drop('channels')
  }
}

module.exports = ChannelsSchema
