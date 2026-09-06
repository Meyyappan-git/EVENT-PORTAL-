const express = require('express');
const { getLeaderboard } = require('../controllers/leaderboard.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');

const router = express.Router();

router.use(authMiddleware);
router.get('/', requireRole('ADMIN', 'PARTICIPANT'), getLeaderboard);

module.exports = router;
