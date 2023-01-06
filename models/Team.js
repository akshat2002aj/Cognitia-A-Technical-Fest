const mongoose = require('mongoose');
const counter = require('../utils/counter');

const TeamSchema = mongoose.Schema({
  nitmId: {
    type: String,
  },
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

TeamSchema.pre('save', async function (next) {
  // Create if for event
  let doc = this;
  if (!this.nitmId)
    this.nitmId = await counter.generateId('team_id', 'team', doc);
  next();
});

module.exports = mongoose.model('Teams', TeamSchema);
