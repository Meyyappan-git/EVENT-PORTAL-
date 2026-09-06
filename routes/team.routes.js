const express = require('express');
const { createTeam, joinTeam, getMyTeam } = require('../controllers/team.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/create', requireRole('PARTICIPANT'), createTeam);
router.post('/join', requireRole('PARTICIPANT'), joinTeam);
router.get('/me', requireRole('PARTICIPANT'), getMyTeam);

module.exports = router;
