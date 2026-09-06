# CSEA Quiz Platform Backend

This repository contains the backend for a real-time quiz/riddle competition platform.

## Stack

- Node.js
- Express
- MongoDB + Mongoose
- Socket.io
- JWT + bcrypt

## Environment

Copy `.env.example` to `.env` and configure the values.

## Local startup

```bash
cp .env.example .env
npm install
node server.js
```

For local testing in environments without a system MongoDB binary, the app will fall back to `mongodb-memory-server` when `MONGODB_URI` is not set.

## API contract

See [docs/api-contract.md](docs/api-contract.md) and [docs/postman_collection.json](docs/postman_collection.json).

## Core behaviors

- Participant and admin role access
- Team creation and joining by code
- Sequential unlock logic based on correct submissions
- Scoring and leaderboard ranking
- Socket.io leaderboard updates
- Submission history and monitoring
