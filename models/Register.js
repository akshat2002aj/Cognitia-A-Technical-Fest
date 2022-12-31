const mongoose = require('mongoose');

const RegisterSchema = mongoose.Schema({
  eventId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Event',
    required: true,
  },
  teamId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Team',
    required: true,
  },
});

module.exports = mongoose.model('Register', RegisterSchema);
