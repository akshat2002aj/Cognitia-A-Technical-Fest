const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  registrationLink: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  prizeMoney: {
    type: Number,
    required: true,
  },
  teamSize: {
    type: Number,
    required: true,
  },
  docLink: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  festType: {
    type: String,
    required: true,
    enum: ['Shishir', 'Cognitia'],
  },
  openFor: {
    type: String,
    required: true,
    enum: ['ALL', 'NITM'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
});

module.exports = mongoose.model('Event', EventSchema);
