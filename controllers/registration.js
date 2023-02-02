const Registration = require('../models/Registration');
const Team = require('../models/Team');
const Event = require('../models/Event');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');

// @desc        Register Event
// @route       POST /api/v1/:eventId/register
// @access      Private (access to teamMember and admin)
exports.register = asyncHandler(async (req, res, next) => {
  // Checking that teamId is present or not
  const registeredTeam = await Team.findOne({ teamsId: req.body.teamId });

  if (!registeredTeam) {
    return next(new ErrorResponse('Team not found', 404));
  }

  // only team owner can register
  if (req.user._id !== registeredTeam.teamOwner && req.user.role === 'user') {
    return next(new ErrorResponse(`Only Team owner can register`, 404));
  }

  //Event Details
  const event = await Event.findOne({ eventId: req.params.eventId });

  if (!event) {
    return next(new ErrorResponse(`Event doesnt exits`, 404));
  }

  // Checking that event is present in database or not
  const registeredEvent = await Registration.findOne({
    eventId: req.params.eventId,
  });

  // if not present then create it in database else push it teamId in that array
  if (!registeredEvent) {
    req.body.eventId = req.params.eventId;
    req.body.teamsId = [req.body.teamId];
    await Registration.create(req.body);
  } else {
    // ? Checking weather team member is registered alread in event or not
    let flag = false;
    registeredTeam.members.forEach((element) => {
      if (event.registeredUser.includes(element)) {
        flag = true;
      }
    });
    if (flag) {
      return next(new ErrorResponse(`Team Member already registered`, 404));
    }
    registeredEvent.teamsId.push(req.body.teamId);
    registeredEvent.save();
  }

  registeredTeam.members.forEach((element) => {
    event.registeredUser.push(element);
  });
  event.save();

  res.status(200).json({
    success: true,
    data: `Team ${req.body.teamId} registered for event ${req.params.eventId}`,
  });
});

// @desc        UnRegister Event
// @route       DELETE /api/v1/:eventId/register/:teamId
// @access      Private (access to teamMember and admin)
exports.unregister = asyncHandler(async (req, res, next) => {
  // Checking that teamId is present or not
  const registeredTeam = await Team.findOne({ teamsId: req.body.teamId });

  if (!registeredTeam) {
    return next(new ErrorResponse('Team not found', 404));
  }

  // only team owner can unregister
  if (req.user._id !== registeredTeam.teamOwner && req.user.role === 'user') {
    return next(new ErrorResponse(`Only Team owner can unregister`, 404));
  }

  //Event Details
  const event = await Event.findOne({ eventId: req.params.eventId });

  if (!event) {
    return next(new ErrorResponse(`Event doesnt exits`, 404));
  }

  // Checking that event is present in database or not
  const registeredEvent = await Registration.findOne({
    eventId: req.params.eventId,
  });

  registeredTeam.members.forEach((element) => {
    const index = event.registeredUser.indexOf(element);

    const x = event.registeredUser.splice(index, 1);
  });
  event.save();

  const index = registeredEvent.teamsId.indexOf(req.body.teamId);
  registeredEvent.teamsId.splice(index, 1);
  registeredEvent.save();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc        Get Registered User
// @route       GET /api/v1/:eventId/register
// @access      Private (access to teamMember and admin)
exports.getTeams = asyncHandler(async (req, res, next) => {
  //Event Details
  const event = await Event.findOne({ eventId: req.params.eventId });

  if (!event) {
    return next(new ErrorResponse(`Event doesnt exits`, 404));
  }

  // Checking that event is present in database or not
  const registeredEvent = await Registration.findOne({
    eventId: req.params.eventId,
  }).populate('teamsId');

  if (!registeredEvent) {
    return next(new ErrorResponse(`No Members is registered yet`, 404));
  }
  res.status(200).json({
    success: true,
    data: registeredEvent,
  });
});
