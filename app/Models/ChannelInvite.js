'use strict'

const Model = use('Model')

class ChannelInvite extends Model {
  channel() {
    return this.belongsTo('App/Models/Channel')
  }

  sender() {
    return this.belongsTo('App/Models/User', 'sender_id', 'id')
  }

  receiver() {
    return this.belongsTo('App/Models/User', 'receiver_id', 'id')
  }
}

module.exports = ChannelInvite
