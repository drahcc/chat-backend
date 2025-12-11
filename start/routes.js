const Route = use('Route')

// AUTH
Route.post('/register', 'AuthController.register')
Route.post('/login', 'AuthController.login')

// USER STATUSES (public endpoint)
Route.get('/users/statuses', 'UsersController.getAllStatuses')

// PROTECTED ROUTES
Route.group(() => {

  // CHANNEL CRUD
  Route.get('/channels', 'ChannelController.index')
  Route.post('/channels', 'ChannelController.create')
  Route.get('/channels/:id', 'ChannelController.show')
  Route.patch('/channels/:id', 'ChannelController.update')

  // MEMBERSHIP
  Route.post('/channels/:id/join', 'ChannelController.join')
  Route.post('/channels/:id/leave', 'ChannelController.leave')
  Route.post('/channels/:id/invite', 'ChannelController.invite')
  Route.post('/channels/:id/clear-invite-flag', 'ChannelController.clearInviteFlag')
  Route.get('/channels/:id/members', 'ChannelController.list')
  Route.post('/channels/cleanup', 'ChannelController.cleanup')

  // INVITES
  Route.get('/channels/:id/invites', 'ChannelInviteController.list')
  Route.post('/channels/:id/invites/:userId', 'ChannelInviteController.create')
  Route.put('/channels/:id/invites/:userId', 'ChannelInviteController.accept')
  Route.delete('/channels/:id/invites/:userId', 'ChannelInviteController.decline')

  // BAN / UNBAN
  Route.post('/channels/:id/ban', 'ChannelController.banUser')
  Route.post('/channels/:id/unban', 'ChannelController.unbanUser')

  // KICK
  Route.post('/channels/:id/kick', 'KickController.kick')

  // MESSAGES
  Route.get('/channels/:channelId/messages', 'MessageController.getMessages')
  Route.post('/channels/:channelId/messages', 'MessageController.send')
  Route.post('/messages/command', 'MessageController.sendCommand')
  Route.put('/messages/:id', 'MessageController.edit')
  Route.delete('/messages/:id', 'MessageController.delete')
  Route.get('/channels/:channelId/messages/search', 'MessageController.search')

  // MESSAGE REACTIONS
  Route.get('/messages/:id/reactions', 'MessageReactionController.index')
  Route.post('/messages/:id/reactions', 'MessageReactionController.add')
  Route.delete('/messages/:id/reactions/:emoji', 'MessageReactionController.remove')

  // MESSAGE READ RECEIPTS
  Route.post('/messages/read', 'MessageReadController.markAsRead')
  Route.post('/messages/read/multiple', 'MessageReadController.markMultipleAsRead')
  Route.get('/messages/:id/reads', 'MessageReadController.getReads')

  // PINNED MESSAGES
  Route.get('/channels/:channelId/pinned', 'PinnedMessageController.index')
  Route.post('/messages/:id/pin', 'PinnedMessageController.pin')
  Route.delete('/messages/:id/pin', 'PinnedMessageController.unpin')

  // FILE ATTACHMENTS
  Route.post('/messages/:messageId/files', 'FileAttachmentController.upload')
  Route.delete('/attachments/:id', 'FileAttachmentController.delete')

  // USER PROFILES
  Route.get('/users/:id/profile', 'ProfileController.show')
  Route.put('/profile', 'ProfileController.update')
  Route.post('/profile/avatar', 'ProfileController.uploadAvatar')

  // USER STATUS & PREFERENCES
  Route.post('/users/status', 'UsersController.updateStatus')
  Route.post('/users/notification-preference', 'UsersController.updateNotificationPreference')
  Route.get('/users/notification-preference', 'UsersController.getNotificationPreference')

}).middleware(['auth'])

