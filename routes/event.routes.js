const express = require('express');
const { getEvents, createEvent, setCurrentRound, getEvent } = require('../controllers/event.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', requireRole('ADMIN'), getEvents);
router.get('/:id', requireRole('ADMIN', 'PARTICIPANT'), getEvent);
router.post('/', requireRole('ADMIN'), createEvent);
router.patch('/:id/current-round', requireRole('ADMIN'), setCurrentRound);

module.exports = router;
