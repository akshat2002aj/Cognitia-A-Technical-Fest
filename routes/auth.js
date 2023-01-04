const express = require('express');
const {
  register,
  logIn,
  logout,
  confirmEmail,
} = require('../controllers/auth');

const router = express.Router();

router.post('/register', register);
router.get('/confirmemail', confirmEmail);
router.post('/login', logIn);
router.get('/logout', logout);

module.exports = router;
