const express = require('express');
const { createSubmission, getSubmissions } = require('../controllers/submission.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', requireRole('PARTICIPANT'), createSubmission);
router.get('/', requireRole('ADMIN'), getSubmissions);

module.exports = router;
