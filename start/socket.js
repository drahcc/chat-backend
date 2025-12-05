'use strict'

const Ws = use('Ws')

/**
 * Register WebSocket channels.
 * chat:* → covers all chat room IDs
 */
Ws.channel('chat:*', 'ChatController')
