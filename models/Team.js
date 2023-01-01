const mongoose = require('mongoose');

const TeamSchema = mongoose.Schema({
  _id: {
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

EventSchema.pre('save', async function (next) {
  let doc = this;
  this._id = await counter.generateId('team_id', 'team', doc);
  next();
});

module.exports = mongoose.model('Teams', TeamSchema);
