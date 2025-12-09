'use strict'

const Schema = use('Schema')

class FileAttachmentsSchema extends Schema {
  up () {
    this.create('file_attachments', (table) => {
      table.increments()
      table.integer('message_id').unsigned().references('id').inTable('messages').onDelete('CASCADE')
      table.string('filename', 255).notNullable()
      table.string('original_name', 255).notNullable()
      table.string('mime_type', 100).notNullable()
      table.integer('file_size').unsigned().notNullable() // in bytes
      table.string('file_path', 500).notNullable() // path on server or cloud URL
      table.timestamps()
    })
  }

  down () {
    this.drop('file_attachments')
  }
}

module.exports = FileAttachmentsSchema
