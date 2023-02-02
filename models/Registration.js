const mongoose = require('mongoose');

const RegisterSchema = mongoose.Schema({
  eventId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Event',
  },
  teamsId: {
    type: [mongoose.Schema.ObjectId],
    ref: 'Teams',
    required: true,
  },
});

module.exports = mongoose.model('Register', RegisterSchema);
