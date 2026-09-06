const express = require('express');
const cors = require('cors');

const { CLIENT_URL, NODE_ENV } = require('./config/env');
const { apiResponse } = require('./utils/apiResponse');
const errorMiddleware = require('./middlewares/error.middleware');

const authRoutes = require('./routes/auth.routes');
const teamRoutes = require('./routes/team.routes');
const eventRoutes = require('./routes/event.routes');
const roundRoutes = require('./routes/round.routes');
const questionRoutes = require('./routes/question.routes');
const submissionRoutes = require('./routes/submission.routes');
const leaderboardRoutes = require('./routes/leaderboard.routes');

const app = express();

const allowedOrigins = [
  CLIENT_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }),
);
app.use(express.json());

app.get('/health', (req, res) => {
  res.json(apiResponse(true, { status: 'ok', environment: NODE_ENV }));
});

app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/rounds', roundRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

app.use(errorMiddleware);

module.exports = app;
