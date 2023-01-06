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
const router = express.Router();

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
