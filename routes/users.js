const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/users');

const User = require('../models/User');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middlewares/advanceResults');
const { protect, authorize } = require('../middlewares/auth');

router.use(protect);
router.use(authorize('admin'));

router.route('/').get(advancedResults(User), getUsers).post(createUser);

router.route('/:userId').get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;