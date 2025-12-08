import { defineStore } from 'pinia'

export const useSocketStore = defineStore('socket', {
  state: () => ({
    socket: null,
    messages: []
  }),

  actions: {
    setSocket(s) {
      this.socket = s
    },

    joinChannel(channelId) {
      if (!this.socket) return
      this.socket.emit('join', { channel_id: channelId })
    },

    leaveChannel(channelId) {
      if (!this.socket) return
      this.socket.emit('leave', { channel_id: channelId })
    },

    sendMessage(channelId, content) {
      if (!this.socket) return
      this.socket.emit('message', {
        channel_id: channelId,
        content: content
      })
    },

    addMessage(msg) {
      this.messages.push(msg)
    }
  }
})
