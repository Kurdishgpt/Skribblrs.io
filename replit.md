# یاری وێنەکێشان (Drawing Game)

A Kurdish (Sorani) multiplayer drawing and guessing game - based on Skribbl.io.

## Overview
This is a real-time multiplayer drawing game built with Node.js, Express, Socket.io, and EJS templates. Players can create private rooms, draw pictures, and guess what others are drawing. The entire interface is in Central Kurdish (Sorani).

## Tech Stack
- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Template Engine**: EJS
- **Real-time Communication**: Socket.io
- **Frontend**: HTML, CSS, JavaScript (RTL layout)
- **Avatar Service**: DiceBear API v9.x

## Project Structure
```
.
├── app.js           # Express app configuration
├── bin/www          # Server entry point (port 5000)
├── sockets.js       # Socket.io event handlers
├── words.json       # Kurdish word list for the game
├── controllers/     # Route controllers
├── views/           # EJS templates (Kurdish RTL)
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

## Recent Changes (Jan 26, 2026)
- Changed main language to Kurdish (Central Kurdish/Sorani)
- Updated all words to Kurdish
- Translated entire UI to Kurdish
- Set RTL layout direction
- Removed developer attribution footer
- Fixed avatar system by upgrading to DiceBear API v9.x
- Updated avatar style options for new API compatibility

## Development Notes
- Server binds to `0.0.0.0:5000` for Replit compatibility
- Uses global state for game management (`global.games`, `global.round`)
- Interface uses right-to-left (RTL) layout for Kurdish language
