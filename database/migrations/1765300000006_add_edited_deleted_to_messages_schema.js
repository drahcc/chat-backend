'use strict'

const Schema = use('Schema')

class AddEditedDeletedToMessagesSchema extends Schema {
  up () {
    this.table('messages', (table) => {
      table.boolean('is_edited').defaultTo(false)
      table.timestamp('edited_at').nullable()
      table.boolean('is_deleted').defaultTo(false)
      table.timestamp('deleted_at').nullable()
    })
  }

  down () {
    this.table('messages', (table) => {
      table.dropColumn('is_edited')
      table.dropColumn('edited_at')
      table.dropColumn('is_deleted')
      table.dropColumn('deleted_at')
    })
  }
}

module.exports = AddEditedDeletedToMessagesSchema
