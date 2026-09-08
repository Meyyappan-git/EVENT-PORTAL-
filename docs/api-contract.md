# CSEA Quiz Platform Backend API Contract

## Base URL

- Local: http://localhost:5011/api

## Response format

Every route returns:

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

or

```json
{
  "success": false,
  "data": null,
  "error": "Message"
}
```

## Socket.IO

Connect to `http://localhost:5011` with a JWT:

```js
io('http://localhost:5011', { auth: { token } });
```

The server listens for `join-event` and `join-room` with `{ eventId }`, joining clients to `event:<eventId>`.

The server emits `leaderboard:update` after a correct submission and `submission-received` after any submission.

## Authentication

Include a bearer token in the Authorization header:

```http
Authorization: Bearer <jwt>
```

## Auth

### POST /auth/register

Request:

```json
{
  "name": "Alex Morgan",
  "email": "alex@example.com",
  "password": "Password123!",
  "role": "PARTICIPANT"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "67d12f0ef331fe53f7319b2b",
      "name": "Alex Morgan",
      "email": "alex@example.com",
      "role": "PARTICIPANT",
      "teamId": null
    },
    "token": "eyJhbGciOiJIUzI1NiJ9..."
  },
  "error": null
}
```

### POST /auth/login

Request:

```json
{
  "email": "alex@example.com",
  "password": "Password123!"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "67d12f0ef331fe53f7319b2b",
      "name": "Alex Morgan",
      "email": "alex@example.com",
      "role": "PARTICIPANT",
      "teamId": null
    },
    "token": "eyJhbGciOiJIUzI1NiJ9..."
  },
  "error": null
}
```

## Teams

### POST /teams/create

Request:

```json
{
  "name": "Quantum Thinkers"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "_id": "67d12f0ef331fe53f7319b2b",
    "name": "Quantum Thinkers",
    "code": "A7K2M1",
    "members": ["67d12f0ef331fe53f7319b2b"],
    "score": 0,
    "lastSubmissionAt": null
  },
  "error": null
}
```

### POST /teams/join

Request:

```json
{
  "code": "A7K2M1"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "_id": "67d12f0ef331fe53f7319b2b",
    "name": "Quantum Thinkers",
    "code": "A7K2M1",
    "members": ["67d12f0ef331fe53f7319b2b", "67d13aaef331fe53f7319c3d"],
    "score": 0,
    "lastSubmissionAt": null
  },
  "error": null
}
```

### GET /teams/me

Response:

```json
{
  "success": true,
  "data": {
    "_id": "67d12f0ef331fe53f7319b2b",
    "name": "Quantum Thinkers",
    "code": "A7K2M1",
    "members": [
      {
        "_id": "67d12f0ef331fe53f7319b2b",
        "name": "Alex Morgan",
        "email": "alex@example.com",
        "role": "PARTICIPANT"
      }
    ],
    "score": 0,
    "lastSubmissionAt": null
  },
  "error": null
}
```

## Events

### POST /events

Request:

```json
{
  "name": "CSEA Finals"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "_id": "67d12f0ef331fe53f7319b2b",
    "name": "CSEA Finals",
    "status": "UPCOMING",
    "currentRoundId": null
  },
  "error": null
}
```

### PATCH /events/:id/current-round

Request:

```json
{
  "roundId": "67d13aaef331fe53f7319c3d"
}
```

## Rounds

### POST /rounds

Request:

```json
{
  "eventId": "67d12f0ef331fe53f7319b2b",
  "name": "Round 1",
  "status": "OPEN",
  "questionIds": []
}
```

### PATCH /rounds/:id/open

### PATCH /rounds/:id/close

## Questions

### POST /questions

Request:

```json
{
  "roundId": "67d13aaef331fe53f7319c3d",
  "title": "What is 2 + 2?",
  "description": "Solve the arithmetic puzzle.",
  "type": "MCQ",
  "options": ["3", "4", "5", "6"],
  "correctAnswer": "4",
  "points": 10,
  "order": 1
}
```

### GET /questions/current?roundId=...

Response:

```json
{
  "success": true,
  "data": {
    "_id": "67d13aaef331fe53f7319c3d",
    "title": "What is 2 + 2?",
    "description": "Solve the arithmetic puzzle.",
    "type": "MCQ",
    "options": ["3", "4", "5", "6"],
    "correctAnswer": "4",
    "points": 10,
    "order": 1
  },
  "error": null
}
```

## Submissions

### POST /submissions

Request:

```json
{
  "questionId": "67d13aaef331fe53f7319c3d",
  "answer": "4"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "_id": "67d14cfef331fe53f7319d2a",
    "teamId": "67d12f0ef331fe53f7319b2b",
    "questionId": "67d13aaef331fe53f7319c3d",
    "answer": "4",
    "isCorrect": true,
    "pointsAwarded": 10,
    "submittedAt": "2026-09-06T12:00:00.000Z"
  },
  "error": null
}
```

### GET /submissions?teamId=...&questionId=...

Response:

```json
{
  "success": true,
  "data": [
    {
      "_id": "67d14cfef331fe53f7319d2a",
      "teamId": {
        "_id": "67d12f0ef331fe53f7319b2b",
        "name": "Quantum Thinkers",
        "code": "A7K2M1"
      },
      "questionId": {
        "_id": "67d13aaef331fe53f7319c3d",
        "title": "What is 2 + 2?"
      },
      "answer": "4",
      "isCorrect": true,
      "pointsAwarded": 10,
      "submittedAt": "2026-09-06T12:00:00.000Z"
    }
  ],
  "error": null
}
```

## Leaderboard

### GET /leaderboard

Response:

```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "teamId": "67d12f0ef331fe53f7319b2b",
      "name": "Quantum Thinkers",
      "code": "A7K2M1",
      "score": 250,
      "lastSubmissionAt": "2026-09-06T12:00:00.000Z",
      "members": []
    }
  ],
  "error": null
}
```
