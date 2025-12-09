'use strict'

const ChannelInvite = use('App/Models/ChannelInvite')
const Channel = use('App/Models/Channel')
const ChannelMember = use('App/Models/ChannelMember')
const User = use('App/Models/User')

class ChannelInviteController {

  /**
   * GET /channels/:id/invites
   * List all invites for a channel
   */
  async list({ params, auth, response }) {
    try {
      const user = await auth.getUser()
      const channel = await Channel.find(params.id)

      if (!channel) {
        return response.status(404).json({ error: 'Channel not found' })
      }

      // Only channel admin can see invites
      const membership = await ChannelMember
        .query()
        .where('channel_id', channel.id)
        .where('user_id', user.id)
        .first()

      if (!membership || !membership.is_admin) {
        return response.status(403).json({ error: 'Only admin can view invites' })
      }

      const invites = await ChannelInvite
        .query()
        .where('channel_id', channel.id)
        .with('sender')
        .with('receiver')
        .fetch()

      return response.json({ data: invites })
    } catch (error) {
      console.error('List invites error:', error.message)
      return response.status(500).json({ error: error.message })
    }
  }

  /**
   * POST /channels/:id/invites/:userId
   * Create invite for private channel
   */
  async create({ params, auth, response }) {
    try {
      const user = await auth.getUser()
      const channel = await Channel.find(params.id)
      const receiverId = params.userId

      if (!channel) {
        return response.status(404).json({ error: 'Channel not found' })
      }

      // Only channel admin can invite
      const membership = await ChannelMember
        .query()
        .where('channel_id', channel.id)
        .where('user_id', user.id)
        .first()

      if (!membership || !membership.is_admin) {
        return response.status(403).json({ error: 'Only admin can invite' })
      }

      const receiver = await User.find(receiverId)
      if (!receiver) {
        return response.status(404).json({ error: 'User not found' })
      }

      // Check if already invited
      const existing = await ChannelInvite
        .query()
        .where('channel_id', channel.id)
        .where('receiver_id', receiverId)
        .where('status', 'pending')
        .first()

      if (existing) {
        return response.json({ success: true, already_invited: true })
      }

      // Check if already member
      const isMember = await ChannelMember
        .query()
        .where('channel_id', channel.id)
        .where('user_id', receiverId)
        .first()

      if (isMember) {
        return response.json({ success: true, already_member: true })
      }

      // Create invite
      const invite = await ChannelInvite.create({
        channel_id: channel.id,
        sender_id: user.id,
        receiver_id: receiverId,
        status: 'pending'
      })

      await invite.load('sender')
      await invite.load('receiver')

      return response.json({ success: true, invite: invite.toJSON() })
    } catch (error) {
      console.error('Create invite error:', error.message)
      return response.status(500).json({ error: error.message })
    }
  }

  /**
   * PUT /channels/:id/invites/:userId
   * Accept invite
   */
  async accept({ params, auth, response }) {
    try {
      const user = await auth.getUser()
      const channel = await Channel.find(params.id)
      const receiverId = parseInt(params.userId)

      if (!channel) {
        return response.status(404).json({ error: 'Channel not found' })
      }

      // Find invite
      const invite = await ChannelInvite
        .query()
        .where('channel_id', channel.id)
        .where('receiver_id', receiverId)
        .where('status', 'pending')
        .first()

      if (!invite) {
        return response.status(404).json({ error: 'No pending invite' })
      }

      // Accept invite
      invite.status = 'accepted'
      await invite.save()

      // Add to channel members
      const existing = await ChannelMember
        .query()
        .where('channel_id', channel.id)
        .where('user_id', receiverId)
        .first()

      if (!existing) {
        await ChannelMember.create({
          channel_id: channel.id,
          user_id: receiverId,
          is_admin: false
        })
      }

      return response.json({ success: true, accepted: true })
    } catch (error) {
      console.error('Accept invite error:', error.message)
      return response.status(500).json({ error: error.message })
    }
  }

  /**
   * DELETE /channels/:id/invites/:userId
   * Decline invite
   */
  async decline({ params, auth, response }) {
    try {
      const user = await auth.getUser()
      const channel = await Channel.find(params.id)
      const receiverId = parseInt(params.userId)

      if (!channel) {
        return response.status(404).json({ error: 'Channel not found' })
      }

      // Find invite
      const invite = await ChannelInvite
        .query()
        .where('channel_id', channel.id)
        .where('receiver_id', receiverId)
        .where('status', 'pending')
        .first()

      if (!invite) {
        return response.status(404).json({ error: 'No pending invite' })
      }

      // Decline invite
      invite.status = 'declined'
      await invite.save()

      return response.json({ success: true, declined: true })
    } catch (error) {
      console.error('Decline invite error:', error.message)
      return response.status(500).json({ error: error.message })
    }
  }
}

module.exports = ChannelInviteController
