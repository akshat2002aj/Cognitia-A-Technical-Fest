const Event = require('../models/Event');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');

// @desc        Create a new event
// @route       POST /api/v1/event
// @access      Private (access to teamMember and admin)
exports.createEvent = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;
  const event = await Event.create(req.body);
  res.status(200).json({
    success: true,
    data: event,
  });
});

// @desc        Get all events
// @route       GET /api/v1/event
// @access      Public
exports.getEvents = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc        Get event by id
// @route       GET /api/v1/event/:id
// @access      Public
exports.getEvent = asyncHandler(async (req, res, next) => {
  const eventId = req.params.id;
  // Populating details of user
  const event = await Event.findById(eventId).populate({
    path: 'user',
    select: 'name phone nitmId email',
  });

  if (!event) {
    return next(
      new ErrorResponse(`Event not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: event });
});

// @desc        Update event
// @route       Put /api/v1/event/:id
// @access      Private (access to teamMember and admin)
exports.updateEvent = asyncHandler(async (req, res, next) => {
  let event = await Event.findById(req.params.id);

  if (!event) {
    return next(
      new ErrorResponse(`No event with the id of ${req.params.id}`),
      404
    );
  }

  event = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: event });
});

// @desc        Delete event
// @route       Delete /api/v1/event/:id
// @access      Private (access to teamMember and admin)
exports.deleteEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return next(
      new ErrorResponse(`No event with the id of ${req.params.id}`),
      404
    );
  }

  await event.remove();
  res.status(200).json({ success: true, data: {} });
});
