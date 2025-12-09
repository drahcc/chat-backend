'use strict'

const Model = use('Model')

class FileAttachment extends Model {
  message () {
    return this.belongsTo('App/Models/Message')
  }
}

module.exports = FileAttachment
