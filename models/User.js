const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const counter = require('../utils/counter');

const UserSchema = mongoose.Schema({
  _id: {
    type: String,
  },
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Please add a email address'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  confirmEmailToken: String,
  isEmailConfirmed: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    select: false,
    trim: true,
    minLength: [6, 'Minimum length of password should be 6 characters'],
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
    minLength: 10,
    maxLength: 14,
  },
  gender: {
    type: String,
    required: [true, 'Please add a gender'],
    enum: {
      values: ['Male', 'Female', 'Others'],
      message: 'Gender must be one of Male, Female, or Others',
    },
  },
  collegeId: {
    type: String,
    required: [true, 'Please add a collegeId'],
  },
  department: {
    type: String,
    required: [true, 'Please add department'],
  },
  cityState: {
    type: String,
    required: [true, 'Please add City and State Name'],
  },
  role: {
    type: String,
    enum: {
      values: ['admin', 'user', 'teamMember'],
      message: 'Role must be one of admin, user or teamMember',
    },
    default: 'user',
  },
  studentType: {
    type: String,
    enum: {
      values: ['NITM', 'OTHER'],
      message: 'Student Type must be one of NITM or OTHER',
    },
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

UserSchema.pre('save', async function (next) {
  // Create if for event
  let doc = this;
  this._id = await counter.generateId('user_id', 'user', doc);

  // Check Student Type
  let emailType = doc.email.split('@')[1];
  if (emailType === 'nitm.ac.in') {
    this.studentType = 'NITM';
  } else {
    this.studentType = 'OTHER';
  }
  //Encrypt password with bcrypt
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

// Math Password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  const isMatch = await bcrypt.compare(enteredPassword, this.password);
  return isMatch;
};

UserSchema.methods = module.exports = mongoose.model('User', UserSchema);
