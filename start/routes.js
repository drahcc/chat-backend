const Route = use('Route')

// AUTH
Route.post('/register', 'AuthController.register')
Route.post('/login', 'AuthController.login')

// PROTECTED
Route.group(() => {

  Route.get('/channels', 'ChannelController.index')
  Route.post('/channels', 'ChannelController.create')
  Route.get('/channels/:id', 'ChannelController.show')

  Route.post('/channels/:id/join', 'ChannelController.join')
  Route.post('/channels/:id/leave', 'ChannelController.leave')

  Route.post('/channels/:id/invite', 'ChannelController.invite')
  Route.get('/channels/:id/members', 'ChannelController.list')

  Route.post('/channels/cleanup', 'ChannelController.cleanup')

  // MESSAGES
  Route.get('/channels/:channelId/messages', 'MessageController.getMessages')
  Route.post('/channels/:channelId/messages', 'MessageController.send')

  Route.post('/channels/:id/ban', 'ChannelController.banUser')
  Route.post('/channels/:id/unban', 'ChannelController.unbanUser')

  // JOIN channel
  Route.post('/channels/:id/join', 'ChannelMemberController.join').middleware('auth')

  // SEND message
  //Route.post('/channels/:id/messages', 'MessageController.send').middleware('auth')



}).middleware(['auth'])
