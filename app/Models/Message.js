'use strict'

const Model = use('Model')

class Message extends Model {
  user () {
    return this.belongsTo('App/Models/User', 'user_id', 'id')
  }

  channel () {
    return this.belongsTo('App/Models/Channel', 'channel_id', 'id')
  }

  reactions () {
    return this.hasMany('App/Models/MessageReaction')
  }

  reads () {
    return this.hasMany('App/Models/MessageRead')
  }

  attachments () {
    return this.hasMany('App/Models/FileAttachment')
  }

  pinnedIn () {
    return this.hasMany('App/Models/PinnedMessage')
  }

  // опция: ако искаш автоматично сериализиране/скриване
  static get hidden () {
    return []
  }
}

module.exports = Message
