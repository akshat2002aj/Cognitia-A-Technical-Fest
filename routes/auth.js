const express = require('express');
const {
  register,
  confirmEmail,
  logIn,
  logout,
  forgetPassword,
  resetPassword,
  getMe,
} = require('../controllers/auth');

const { protect } = require('../middlewares/auth');

const router = express.Router();

router.post('/register', register);
router.get('/confirmemail', confirmEmail);
router.post('/login', logIn);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.post('/forgetpassword', forgetPassword);
router.post('/resetpassword/:resettoken', resetPassword);

module.exports = router;
