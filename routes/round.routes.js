const express = require('express');
const { getRounds, createRound, updateRound, deleteRound, openRound, closeRound } = require('../controllers/round.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', requireRole('ADMIN'), getRounds);
router.post('/', requireRole('ADMIN'), createRound);
router.put('/:id', requireRole('ADMIN'), updateRound);
router.delete('/:id', requireRole('ADMIN'), deleteRound);
router.patch('/:id/open', requireRole('ADMIN'), openRound);
router.patch('/:id/close', requireRole('ADMIN'), closeRound);

module.exports = router;
