const mongoose = require('mongoose');
const { findByIdAndUpdate } = require('./Event');

const CounterSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  seq: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model('Counter', CounterSchema);
