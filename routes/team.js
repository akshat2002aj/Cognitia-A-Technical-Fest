const express = require('express');
const Team = require('../models/Team');
const {
  createTeam,
  getTeams,
  getTeam,
  updateTeam,
  deleteTeam,
} = require('../controllers/team');
const advancedResults = require('../middlewares/advanceResults');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router
  .route('/')
  .post(protect, createTeam)
  .get(
    protect,
    authorize('admin', 'teamMember'),
    advancedResults(Team, {
      path: 'members',
      select: 'name nitmId phone email',
    }),
    getTeams
  );

router
  .route('/:teamId')
  .get(protect, getTeam)
  .put(protect, updateTeam)
  .delete(protect, deleteTeam);

module.exports = router;
