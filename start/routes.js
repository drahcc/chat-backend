const Route = use('Route')

// AUTH
Route.post('/register', 'AuthController.register')
Route.post('/login', 'AuthController.login')

// PROTECTED ROUTES
Route.group(() => {

  // CHANNEL CRUD
  Route.get('/channels', 'ChannelController.index')
  Route.post('/channels', 'ChannelController.create')
  Route.get('/channels/:id', 'ChannelController.show')

  // MEMBERSHIP
  Route.post('/channels/:id/join', 'ChannelController.join')
  Route.post('/channels/:id/leave', 'ChannelController.leave')
  Route.post('/channels/:id/invite', 'ChannelController.invite')
  Route.get('/channels/:id/members', 'ChannelController.list')
  Route.post('/channels/cleanup', 'ChannelController.cleanup')

  // BAN / UNBAN
  Route.post('/channels/:id/ban', 'ChannelController.banUser')
  Route.post('/channels/:id/unban', 'ChannelController.unbanUser')

  // KICK
  Route.post('/channels/:id/kick', 'KickController.kick')

  // MESSAGES
  Route.get('/channels/:channelId/messages', 'MessageController.getMessages')
  Route.post('/channels/:channelId/messages', 'MessageController.send')

}).middleware(['auth'])
