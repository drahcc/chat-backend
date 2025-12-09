'use strict'

const MessageReaction = use('App/Models/MessageReaction')
const Message = use('App/Models/Message')

class MessageReactionController {
  // Add reaction to message
  async add ({ request, auth, response, params }) {
    try {
      const user = await auth.getUser()
      const { emoji } = request.only(['emoji'])
      const messageId = params.id

      // Check if message exists
      const message = await Message.find(messageId)
      if (!message) {
        return response.status(404).json({ error: 'Message not found' })
      }

      // Add or update reaction
      const reaction = await MessageReaction.findOrCreate(
        { message_id: messageId, user_id: user.id, emoji },
        { message_id: messageId, user_id: user.id, emoji }
      )

      await reaction.load('user')

      return response.json({ reaction })
    } catch (error) {
      console.error('Add reaction error:', error)
      return response.status(500).json({ error: 'Failed to add reaction' })
    }
  }

  // Remove reaction from message
  async remove ({ auth, response, params }) {
    try {
      const user = await auth.getUser()
      const { id: messageId, emoji } = params

      const reaction = await MessageReaction
        .query()
        .where('message_id', messageId)
        .where('user_id', user.id)
        .where('emoji', emoji)
        .first()

      if (reaction) {
        await reaction.delete()
      }

      return response.json({ success: true })
    } catch (error) {
      console.error('Remove reaction error:', error)
      return response.status(500).json({ error: 'Failed to remove reaction' })
    }
  }

  // Get all reactions for a message
  async index ({ params, response }) {
    try {
      const messageId = params.id

      const reactions = await MessageReaction
        .query()
        .where('message_id', messageId)
        .with('user')
        .fetch()

      return response.json({ reactions })
    } catch (error) {
      console.error('Get reactions error:', error)
      return response.status(500).json({ error: 'Failed to get reactions' })
    }
  }
}

module.exports = MessageReactionController
