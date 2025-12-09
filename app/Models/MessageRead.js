'use strict'

const Model = use('Model')

class MessageRead extends Model {
  message () {
    return this.belongsTo('App/Models/Message')
  }

  user () {
    return this.belongsTo('App/Models/User')
  }
}

module.exports = MessageRead
