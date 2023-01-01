const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const UserSchema = mongoose.Schema({
  _id: {
    type: String,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
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
  role: {
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
  image: {
    type: String,
  },
});

EventSchema.pre('save', async function (next) {
  let doc = this;
  this._id = await counter.generateId('user_id', 'user', doc);
  next();
});

//Encrypt password with bcrypt
UserSchema.pre('save', async function (next) {
  let doc = this;
  const salt = await bcrypt.genSalt(10);
  let password = await bcrypt.hash(doc.password, salt);
  this.password = password;
  next();
});

// Sign Jwt and return
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

UserSchema.methods = module.exports = mongoose.model('User', UserSchema);
