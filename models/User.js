const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  image: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    minLength: 10,
    maxLength: 14,
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Others'],
  },
  collegeId: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  cityState: {
    type: String,
    required: true,
  },
  userType: {
    type: String,
    enum: ['admin', 'user', 'teamMember'],
    default: 'user',
    required: true,
  },
  studentType: {
    type: String,
    enum: ['NITM', 'OTHER'],
  },
  position: {
    type: String,
    trim: true,
  },
  event: {
    type: mongoose.Schema.ObjectId,
    ref: 'Event',
  },
});

module.exports = mongoose.model('User', UserSchema);
