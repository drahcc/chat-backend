'use strict'

const Schema = use('Schema')

class ChannelInvitesSchema extends Schema {
  up () {
    this.create('channel_invites', (table) => {
      table.increments()
      table.integer('channel_id').unsigned().references('id').inTable('channels').onDelete('CASCADE')
      table.integer('sender_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.integer('receiver_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.string('status').defaultTo('pending') // pending | accepted | declined
      table.timestamp('created_at').defaultTo(this.fn.now())
    })
  }

  down () {
    this.drop('channel_invites')
  }
}

module.exports = ChannelInvitesSchema
