'use strict'

class ChatController {
  constructor({ socket }) {
    this.socket = socket

    // topic: "chat:1"
    const [, channelId] = socket.topic.split(':')
    this.channelId = Number(channelId)

    console.log(`🔌 WS connected → channel ${this.channelId}`)
  }

  /**
   * 📩 MESSAGE EVENT
   */
  onMessage(data) {
    console.log(`💬 message in ${this.channelId}:`, data)

    const payload = {
      channel_id: this.channelId,
      ...data
    }

    // send to ALL except sender
    this.socket.broadcastToAll('message', payload)

    // send back to sender also
    this.socket.emit('message', payload)
  }

  /**
   * ✏️ TYPING EVENT
   */
  onTyping(data) {
    console.log(`✏️ typing in ${this.channelId}`, data)

    const payload = {
      channel_id: this.channelId,
      ...data
    }

    this.socket.broadcastToAll('typing', payload)
  }

  /**
   * 🙋‍♂️ JOIN EVENT
   */
  onJoin(data) {
    const payload = {
      channel_id: this.channelId,
      ...data
    }

    console.log(`➡️ user joined ${this.channelId}`, data)

    this.socket.broadcastToAll('join', payload)
  }

  /**
   * 👋 LEAVE EVENT
   */
  onLeave(data) {
    const payload = {
      channel_id: this.channelId,
      ...data
    }

    console.log(`⬅️ user left ${this.channelId}`, data)

    this.socket.broadcastToAll('leave', payload)
  }

  /**
   * 🔌 DISCONNECT
   */
  onClose() {
    console.log(`❌ WS disconnected from channel ${this.channelId}`)
  }
}

module.exports = ChatController
