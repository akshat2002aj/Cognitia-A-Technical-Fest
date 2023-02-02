const express = require('express');
const { protect, authorize } = require('../middlewares/auth');
const advancedResults = require('../middlewares/advanceResults');
const {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
} = require('../controllers/event');
const Event = require('../models/Event');

// Include other resourse routers
const registerRouter = require('./registration');

const router = express.Router();

// Re-route into other resourse routers
router.use('/:eventId/register', registerRouter);

router
  .route('/')
  .post(protect, authorize('admin', 'teamMember'), createEvent)
  .get(advancedResults(Event, 'user'), getEvents);

router
  .route('/:id')
  .get(getEvent)
  .put(protect, authorize('admin', 'teamMember'), updateEvent)
  .delete(protect, authorize('admin', 'teamMember'), deleteEvent);

module.exports = router;
