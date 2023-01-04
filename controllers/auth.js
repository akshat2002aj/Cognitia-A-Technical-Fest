const User = require('../models/User');
const asyncHandler = require('../middlewares/async');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const ErrorResponse = require('../utils/errorResponse');
// @desc        Register user
// @route       Get /api/v1/auth/register
// @access      Public
exports.register = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  // grab token and send to email
  const confirmEmailToken = user.generateEmailConfirmToken();

  await user.save({ validateBeforeSave: false });

  // Create reset url
  const confirmEmailURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/confirmemail?token=${confirmEmailToken}`;

  const message = `
  <div>
    <h1>Email Confirmation</h1>
    <h2>Hello ${user.name}</h2>
    <p>Thank you for subscribing. Please confirm your email by clicking on the following link</p>
    <a href=${confirmEmailURL}> Click here</a>
  </div>`;

  try {
    const sendResult = await sendEmail({
      email: user.email,
      subject: 'Email confirmation token',
      message,
    });

    res.status(200).json({
      success: true,
      data: 'Email sent successfully',
    });
  } catch (error) {
    user.confirmEmailToken = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('Email could not be send.', 500));
  }

  // sendAuthTokenResponse(user, 200, res);
});

// @desc    Confirm Email
// @route   GET /api/v1/auth/confirmemail
// @access  Public

exports.confirmEmail = asyncHandler(async (req, res, next) => {
  // grab token from url
  const { token } = req.query;

  if (!token) {
    return next(new ErrorResponse('Invalid Token', 400));
  }

  const splitToken = token.split('.')[0];
  const confirmEmailToken = crypto
    .createHash('sha256')
    .update(splitToken)
    .digest('hex');

  // get user by token
  const user = await User.findOne({
    confirmEmailToken,
    isEmailConfirmed: false,
  });

  if (!user) {
    return next(new ErrorResponse('Invalid Token', 400));
  }

  // update confirmed to true
  user.confirmEmailToken = undefined;
  user.isEmailConfirmed = true;

  // save
  try {
    await user.save({ validateBeforeSave: false });
  } catch (error) {
    console.log(error);
  }

  // return token
  res.status(200).json({
    success: true,
    data: 'Your Email has been successfully verified.',
  });
});

// @desc        Login user
// @route       Get /api/v1/auth/login
// @access      Public
exports.logIn = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate Email and password
  if (!email || !password) {
    return next(new ErrorResponse(`Please Provide an email and password`, 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    next(new ErrorResponse(`Invalid credentials`, 401));
  }

  // Check if Password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse(`Invalid credentials`, 401));
  }

  sendAuthTokenResponse(user, 200, res);
});

// @desc      Log user out / clear cookie
// @route     GET /api/v1/auth/logout
// @access    Public
exports.logout = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    data: {},
  });
});

sendAuthTokenResponse = (user, statusCode, res) => {
  // Create Token
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
  });
};
