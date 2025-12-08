'use strict'

const Message = use('App/Models/Message')
const Channel = use('App/Models/Channel')
const ChannelMember = use('App/Models/ChannelMember')
const User = use('App/Models/User')

class ChatController {
  constructor({ socket }) {
    this.socket = socket

    // topic: "chat:1"
    const [, channelId] = socket.topic.split(':')
    this.channelId = Number(channelId)

    console.log(`🔌 WS connected → channel ${this.channelId}`)
  }

  async onMessage(data) {
    try {
      console.log(`📨 [${this.channelId}] Received message event:`, { user_id: data.user_id, content: data.content?.substring(0, 30) })
      const { user_id, content } = data
      if (!content || !user_id) {
        console.warn('Missing content or user_id')
        return
      }

      // validate membership
      const member = await ChannelMember
        .query()
        .where('channel_id', this.channelId)
        .where('user_id', user_id)
        .first()

      if (!member) {
        this.socket.emit('error', { message: 'Not a member' })
        return
      }

      let mentioned_user_id = null
      const match = content.match(/@([A-Za-z0-9_]+)/)
      if (match) {
        const uname = match[1]
        const mentioned = await User.findBy('username', uname)
        if (mentioned) mentioned_user_id = mentioned.id
      }

      const message = await Message.create({
        channel_id: this.channelId,
        user_id,
        content,
        mentioned_user_id,
        is_command: false
      })

      // Load user data
      const user = await User.find(user_id)

      const payload = {
        id: message.id,
        channel_id: this.channelId,
        user_id,
        content,
        mentioned_user_id,
        created_at: message.created_at,
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          nickname: user.nickname,
          email: user.email
        }
      }

      // Broadcast to ALL (including sender)
      console.log(`📤 Broadcasting message to channel ${this.channelId}:`, payload.content.substring(0, 30))
      this.socket.broadcastToAll('message', payload)

    } catch (err) {
      console.error('onMessage error', err)
      this.socket.emit('error', { message: 'Server error' })
    }
  }

  onTyping(data) {
    const payload = {
      channel_id: this.channelId,
      ...data
    }

    this.socket.broadcastToAll('typing', payload)
  }

  onClose() {
    console.log(`❌ WS disconnected from channel ${this.channelId}`)
  }
}

module.exports = ChatController
