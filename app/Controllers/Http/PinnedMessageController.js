'use strict'

const PinnedMessage = use('App/Models/PinnedMessage')
const Message = use('App/Models/Message')
const ChannelMember = use('App/Models/ChannelMember')

class PinnedMessageController {
  // Pin a message
  async pin ({ request, auth, response, params }) {
    try {
      const user = await auth.getUser()
      const messageId = params.id

      const message = await Message.find(messageId)
      if (!message) {
        return response.status(404).json({ error: 'Message not found' })
      }

      // Check if user is admin or member of the channel
      const membership = await ChannelMember
        .query()
        .where('channel_id', message.channel_id)
        .where('user_id', user.id)
        .first()

      if (!membership || !membership.is_admin) {
        return response.status(403).json({ error: 'Only admins can pin messages' })
      }

      // Pin the message
      const pinnedMessage = await PinnedMessage.findOrCreate(
        { message_id: messageId, channel_id: message.channel_id },
        { message_id: messageId, channel_id: message.channel_id, pinned_by: user.id }
      )

      await pinnedMessage.load('message.user')
      await pinnedMessage.load('pinnedBy')

      return response.json({ success: true, pinnedMessage })
    } catch (error) {
      console.error('Pin message error:', error)
      return response.status(500).json({ error: 'Failed to pin message' })
    }
  }

  // Unpin a message
  async unpin ({ auth, response, params }) {
    try {
      const user = await auth.getUser()
      const messageId = params.id

      const message = await Message.find(messageId)
      if (!message) {
        return response.status(404).json({ error: 'Message not found' })
      }

      // Check if user is admin
      const membership = await ChannelMember
        .query()
        .where('channel_id', message.channel_id)
        .where('user_id', user.id)
        .first()

      if (!membership || !membership.is_admin) {
        return response.status(403).json({ error: 'Only admins can unpin messages' })
      }

      const pinnedMessage = await PinnedMessage
        .query()
        .where('message_id', messageId)
        .where('channel_id', message.channel_id)
        .first()

      if (pinnedMessage) {
        await pinnedMessage.delete()
      }

      return response.json({ success: true })
    } catch (error) {
      console.error('Unpin message error:', error)
      return response.status(500).json({ error: 'Failed to unpin message' })
    }
  }

  // Get all pinned messages for a channel
  async index ({ params, response }) {
    try {
      const channelId = params.channelId

      const pinnedMessages = await PinnedMessage
        .query()
        .where('channel_id', channelId)
        .with('message.user')
        .with('pinnedBy')
        .orderBy('created_at', 'desc')
        .fetch()

      return response.json({ pinnedMessages })
    } catch (error) {
      console.error('Get pinned messages error:', error)
      return response.status(500).json({ error: 'Failed to get pinned messages' })
    }
  }
}

module.exports = PinnedMessageController
