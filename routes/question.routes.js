const express = require('express');
const { createQuestion, updateQuestion, deleteQuestion, getCurrentQuestion } = require('../controllers/question.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', requireRole('ADMIN'), createQuestion);
router.put('/:id', requireRole('ADMIN'), updateQuestion);
router.delete('/:id', requireRole('ADMIN'), deleteQuestion);
router.get('/current', requireRole('PARTICIPANT'), getCurrentQuestion);

module.exports = router;
