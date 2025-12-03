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

}).middleware(['auth'])
