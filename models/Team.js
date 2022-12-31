const mongoose = require('mongoose');

const TeamSchema = mongoose.Schema({
  teamOwner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  members: {
    type: [mongoose.Schema.ObjectId],
    ref: 'User',
  },
});

module.exports = mongoose.model('Teams', TeamSchema);
