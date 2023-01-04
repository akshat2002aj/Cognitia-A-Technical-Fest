const express = require('express');
const { register, logIn, logout } = require('../controllers/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', logIn);
router.get('/logout', logout);

module.exports = router;
