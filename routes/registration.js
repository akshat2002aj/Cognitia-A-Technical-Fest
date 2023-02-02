const express = require('express');
const { protect, authorize } = require('../middlewares/auth');
const advancedResults = require('../middlewares/advanceResults');
const {
  register,
  unregister,
  getTeams,
} = require('../controllers/registration');
const Registration = require('../models/Registration');

const router = express.Router({ mergeParams: true });

router.use(protect);

router
  .route('/')
  .post(register)
  .get(authorize('admin', 'teamMember'), getTeams);
router.route('/:teamId').delete(unregister);

module.exports = router;
