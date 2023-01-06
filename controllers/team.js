const Team = require('../models/Team');
const asyncHandler = require('../middlewares/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc        Create a new team
// @route       POST /api/v1/team
// @access      Public
exports.createTeam = asyncHandler(async (req, res, next) => {
  req.body.teamOwner = req.user.id;
  let teams = await Team.find({ teamOwner: req.user.id });

  // Checking weather same team exists or not by team owner
  let flag = true;
  if (teams.length > 0) {
    teams.forEach((team) => {
      if (JSON.stringify(team.members) === JSON.stringify(req.body.members)) {
        flag = false;
        return res.status(200).json({
          success: true,
          data: team,
        });
      }
    });
  }
  if (flag) {
    teams = await Team.create(req.body);
    res.status(200).json({
      success: true,
      data: teams,
    });
  }
});

// @desc        Get All teams
// @route       GET /api/v1/team
// @access      Private (access to teamMember and admin)
exports.getTeams = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc        Get team
// @route       GET /api/v1/team/:teamId
// @access      Public
exports.getTeam = asyncHandler(async (req, res, next) => {
  const id = req.params.teamId;
  let team;
  if (String(id).length <= 14) {
    team = await Team.find({ nitmId: req.params.teamId }).populate({
      path: 'members',
      select: 'name nitmId phone email',
    });
  } else {
    team = await Team.findById(req.params.teamId).populate({
      path: 'members',
      select: 'name nitmId phone email',
    });
  }
  res.status(200).json({
    success: true,
    data: team,
  });
});

// @desc        Update team
// @route       PUT /api/v1/team/:teamId
// @access      Public (only teamOwner)
exports.updateTeam = asyncHandler(async (req, res, next) => {
  const id = req.params.teamId;
  let team;
  if (String(id).length <= 14) {
    team = await Team.findOne({ nitmId: req.params.teamId });
  } else {
    team = await Team.findById(req.params.teamId);
  }

  if (!team) {
    return next(
      new ErrorResponse(`No team with the id of ${req.params.id}`),
      404
    );
  }
  // Make sure user is team owner
  if (team.teamOwner.toString() !== req.user.id && req.user.role === 'user') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorize to update team ${team.nitmId}`,
        404
      )
    );
  }

  // Checking weather same team exists or not by team owner
  let teams = await Team.find({ teamOwner: req.user.id });
  //   let flag = true;
  if (teams.length > 0) {
    teams.forEach((team) => {
      if (JSON.stringify(team.members) === JSON.stringify(req.body.members)) {
        return res.status(200).json({
          success: true,
          data: team,
        });
      }
    });
  }
  team = await Team.findByIdAndUpdate(team._id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: team });
});

// @desc        Delete team
// @route       DELETE /api/v1/team/:teamId
// @access      Public (only teamOwner)
exports.deleteTeam = asyncHandler(async (req, res, next) => {
  const id = req.params.teamId;
  let team;
  if (String(id).length <= 14) {
    team = await Team.findOne({ nitmId: req.params.teamId });
  } else {
    team = await Team.findById(req.params.teamId);
  }

  if (!team) {
    return next(
      new ErrorResponse(`No team with the id of ${req.params.id}`),
      404
    );
  }

  // Make sure user is team owner
  if (team.teamOwner.toString() !== req.user.id && req.user.role === 'user') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorize to delete team ${team.nitmId}`,
        404
      )
    );
  }

  await team.remove();
  res.status(200).json({ success: true, data: {} });
});
