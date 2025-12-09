'use strict'

const MessageRead = use('App/Models/MessageRead')
const Message = use('App/Models/Message')

class MessageReadController {
  // Mark message as read
  async markAsRead ({ request, auth, response }) {
    try {
      const user = await auth.getUser()
      const { message_id } = request.only(['message_id'])

      // Check if message exists
      const message = await Message.find(message_id)
      if (!message) {
        return response.status(404).json({ error: 'Message not found' })
      }

      // Mark as read (or update timestamp if already exists)
      const read = await MessageRead.findOrCreate(
        { message_id, user_id: user.id },
        { message_id, user_id: user.id }
      )

      return response.json({ read })
    } catch (error) {
      console.error('Mark as read error:', error)
      return response.status(500).json({ error: 'Failed to mark as read' })
    }
  }

  // Mark multiple messages as read
  async markMultipleAsRead ({ request, auth, response }) {
    try {
      const user = await auth.getUser()
      const { message_ids } = request.only(['message_ids'])

      if (!Array.isArray(message_ids)) {
        return response.status(400).json({ error: 'message_ids must be an array' })
      }

      const reads = []
      for (const messageId of message_ids) {
        const read = await MessageRead.findOrCreate(
          { message_id: messageId, user_id: user.id },
          { message_id: messageId, user_id: user.id }
        )
        reads.push(read)
      }

      return response.json({ reads })
    } catch (error) {
      console.error('Mark multiple as read error:', error)
      return response.status(500).json({ error: 'Failed to mark messages as read' })
    }
  }

  // Get read receipts for a message
  async getReads ({ params, response }) {
    try {
      const messageId = params.id

      const reads = await MessageRead
        .query()
        .where('message_id', messageId)
        .with('user')
        .fetch()

      return response.json({ reads })
    } catch (error) {
      console.error('Get reads error:', error)
      return response.status(500).json({ error: 'Failed to get read receipts' })
    }
  }
}

module.exports = MessageReadController
