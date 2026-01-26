# Skribblrs.io

A clone of skribbl.io - a multiplayer drawing and guessing game.

## Overview
This is a real-time multiplayer drawing game built with Node.js, Express, Socket.io, and EJS templates. Players can create private rooms, draw pictures, and guess what others are drawing.

## Tech Stack
- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Template Engine**: EJS
- **Real-time Communication**: Socket.io
- **Frontend**: HTML, CSS, JavaScript

## Project Structure
```
.
├── app.js           # Express app configuration
├── bin/www          # Server entry point
├── sockets.js       # Socket.io event handlers
├── words.json       # Word list for the game
├── controllers/     # Route controllers
├── views/           # EJS templates
│   ├── index.ejs
│   └── partials/
├── public/          # Static assets
│   ├── audio/
│   ├── css/
│   ├── images/
│   └── js/
└── package.json
```

## Running the App
The app runs on port 5000 and is configured via the "Start Server" workflow which executes `npm start`.

## Development Notes
- Server binds to `0.0.0.0:5000` for Replit compatibility
- Uses global state for game management (`global.games`, `global.round`)
