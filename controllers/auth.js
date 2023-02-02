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
    <p>Thank you for registering. Please confirm your email by clicking on the following link</p>
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

  if (!user.isEmailConfirmed) {
    return next(new ErrorResponse(`Please verify your email.`, 401));
  }

  sendAuthTokenResponse(user, 200, res);
});

// @desc      Log user out
// @route     GET /api/v1/auth/logout
// @access    Public
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc        Get current logged in user
// @route       GET /api/v1/auth/me
// @access      Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate({
    path: 'registeredEvents',
    select: 'name description ',
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc        Forgot password
// @route       POST /api/v1/auth/forgetpassword
// @access      Public
exports.forgetPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse('There is no user with that email', 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset Url
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/resetpassword/${resetToken}`;

  const message = `
  <div>
    <h1>Password Reset</h1>
    <h2>Hello ${user.name}</h2>
    <p>You are receiving this email because you (or someone else) has requested the reset of a password. Please click on following link to reset password</p>
    <a href=${resetUrl}> Click here</a>
  </div>`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message,
    });

    res.status(200).json({ success: true, data: 'Email sent' });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordToken = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('Email could not be send.', 500));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc        Reset Password
// @route       GUT /api/v1/auth/resetpassword/:resettoken
// @access      Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    next(new ErrorResponse('Invalid Token', 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  // return token
  res.status(200).json({
    success: true,
    data: 'Password updated successfully.',
  });

  sendAuthTokenResponse(user, 200, res);
});

// @desc        Update user details
// @route       PUT /api/v1/auth/updatedetails
// @access      Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  let user;
  console.log(req.user.body);
  if (req.user.email !== req.body.email && req.body.email) {
    user = await User.findById(req.user.id);
    req.body.isEmailConfirmed = false;
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
    <p>Thank you for registering. Please confirm your email by clicking on the following link</p>
    <a href=${confirmEmailURL}> Click here</a>
  </div>`;

    try {
      const sendResult = await sendEmail({
        email: user.email,
        subject: 'Email confirmation token',
        message,
      });
    } catch (error) {
      user.confirmEmailToken = undefined;
      await user.save({ validateBeforeSave: false });

      return next(new ErrorResponse('Email could not be send.', 500));
    }
  }
  user = await User.findByIdAndUpdate(req.user.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc        Update password
// @route       PUT /api/v1/auth/updatepassword
// @access      Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse(`Password is incorrect`, 401));
  }

  user.password = req.body.newPassword;

  await user.save();

  res.status(200).json({
    success: true,
    data: 'Password updated successfully',
  });
});

sendAuthTokenResponse = (user, statusCode, res) => {
  // Create Token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
  });
};
