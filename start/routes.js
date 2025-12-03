'use strict'

const Route = use('Route')

Route.post('/register', 'UsersController.register')
Route.post('/login', 'UsersController.login')
