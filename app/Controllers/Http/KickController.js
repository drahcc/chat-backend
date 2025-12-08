'use strict'

const Channel = use('App/Models/Channel')
const ChannelMember = use('App/Models/ChannelMember')
const ChannelKick = use('App/Models/ChannelKick')

class KickController {

  async kick({ params, auth, request, response }) {
    const user = await auth.getUser()
    const { user_id } = request.post()  // кого кикаме
    const channelId = params.id

    // Проверяваме дали каналът съществува
    const channel = await Channel.find(channelId)
    if (!channel) {
      return response.status(404).send({ error: 'Channel not found' })
    }

    // Проверка дали текущият потребител е owner/mod
    if (channel.owner_id !== user.id) {
      return response.status(403).send({ error: 'Not allowed' })
    }

    // Проверка дали user_id е в канала
    const member = await ChannelMember
      .query()
      .where('channel_id', channelId)
      .where('user_id', user_id)
      .first()

    if (!member) {
      return response.status(400).send({ error: 'User is not in the channel' })
    }

    // Запис в channel_kicks
    await ChannelKick.create({
      channel_id: channelId,
      user_id,
      kicked_by: user.id
    })

    // Премахваме потребителя
    await member.delete()

    // WebSocket broadcast
    const Ws = use('Ws')
    const topic = Ws.getChannel('chat:*').topic(`chat:${channelId}`)
    if (topic) {
      topic.broadcast('user_kicked', {
        user_id,
        channel_id: channelId,
        kicked_by: user.id
      })
    }

    return { success: true }
  }

}

module.exports = KickController
