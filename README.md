# Chat Backend (AdonisJS + Socket.IO + PostgreSQL)

A real-time chat backend powering channels, messages, mentions, invites, kicks, and notifications. Built with AdonisJS (HTTP API) and a separate Socket.IO server for live events.

## Features
- Auth: register/login; JWT-based auth middleware
- Channels: create, list, join, leave; private/public support
- Messages: send, edit, delete; pagination with infinite scroll support
- Mentions: `@nickname` detection and `mentioned_user_id` support
- Invites: per-user channel invite with `invited_at` highlight; auto-clear on open
- Moderation: kick/ban/unban with audit fields
- Status: user presence (`online`, `away`, `dnd`) with broadcast updates
- Notifications: user `notification_preference` (`all` or `mentions_only`) respected by frontend
- WebSocket: typing indicator, live message push, status updates
- Database: PostgreSQL schema with users, channels, members, messages, bans, tokens

## Tech Stack
- AdonisJS 4 (HTTP API)
- Socket.IO (WebSocket server)
- PostgreSQL (`pg` driver)
- Node.js (LTS recommended)

## Project Structure
chat-backend/
server.js # Adonis HTTP server
socket-server.js # Socket.IO server
app/ # Controllers, Models, Middleware
config/ # app, auth, cors, database, hash, etc.
start/ # routes, app bootstrap, kernel
database/ # migrations, factory
public/ # static assets
README.md # this file

## Requirements
- Node.js ≥ 16 (LTS recommended)
- PostgreSQL ≥ 12
- A `.env` configured for Adonis and DB connection

## Environment Variables
Create `.env` at `chat-backend/` (example below). Adjust to your setup.
HOST=127.0.0.1
PORT=3333
NODE_ENV=development

APP_KEY=use-a-32-char-random-key
DB_CONNECTION=pg
PG_HOST=127.0.0.1
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=postgres
PG_DATABASE=chatzone

CORS_ORIGIN=*
JWT_SECRET=replace-with-secure-secret

SOCKET_HOST=127.0.0.1
SOCKET_PORT=3334

## Install
powershell
cd "c:\Users\PC NITRO INTEL\Desktop\Нова папка\chat-backend"
npm install 

Database Migrations
If using Adonis migrations:
node ace migration:run
Start Servers
Start HTTP API:
cd "c:\Users\PC NITRO INTEL\Desktop\Нова папка\chat-backend"
node server.js
Start Socket.IO:
cd "c:\Users\PC NITRO INTEL\Desktop\Нова папка\chat-backend"
node socket-server.js
API runs at http://127.0.0.1:3333
Socket server runs at ws://127.0.0.1:3334
Key Endpoints (Examples)
Auth:
POST /register — create user
POST /login — get token
Users:
GET /users/notification-preference
POST /users/notification-preference { preference: "all" | "mentions_only" }
POST /users/status { status: "online" | "away" | "dnd" }
Channels:
GET /channels — includes members.user and per-user invited_at
POST /channels/:id/join
POST /channels/:id/leave
POST /channels/:id/clear-invite — clears highlight (invited_at = NULL)
Messages:
GET /channels/:id/messages?page=1&limit=50
POST /channels/:id/messages { content }
POST /messages/command — supports /help, /join, /invite, /kick, /ban, /unban, /list, /cancel, /quit
Socket Events (Client)
message:new — broadcast new messages
typing — typing indicator with preview
status:update — presence changes
user:kick — kick notification for auto-redirect
Invite Highlighting
Backend sets invited_at on invite/join for a specific user
Frontend pins and highlights based on invited_at
When user opens the channel, frontend calls POST /channels/:id/clear-invite to reset
Notifications
Preference stored per user (users.notification_preference)
Frontend respects app visibility and dnd status to show notifications
No Notification actions are used unless a Service Worker is present
Troubleshooting
Node exits with code 1: check .env and config/database.js connectivity to PostgreSQL
Ports busy: ensure 3333 (API) and 3334 (Socket) are free
DB migrations: confirm tables/columns exist (users, channels, channel_members, messages, bans, tokens)
License

