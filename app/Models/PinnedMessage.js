'use strict'

const Model = use('Model')

class PinnedMessage extends Model {
  message () {
    return this.belongsTo('App/Models/Message')
  }

  channel () {
    return this.belongsTo('App/Models/Channel')
  }

  pinnedBy () {
    return this.belongsTo('App/Models/User', 'pinned_by')
  }
}

module.exports = PinnedMessage
