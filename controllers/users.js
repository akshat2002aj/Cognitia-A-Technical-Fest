const User = require('../models/User');
const asyncHandler = require('../middlewares/async');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');
// TODO: Upload Photo Route

// @desc      Create user
// @route     POST /api/v1/users
// @access    Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
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
});

// @desc      Get all users
// @route     GET /api/v1/users
// @access    Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get single user
// @route     GET /api/v1/users/:userId
// @access    Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const id = req.params.userId;
  let user;
  if (String(id).length <= 14) {
    user = await User.find({ nitmId: req.params.userId });
  } else {
    user = await User.findById(req.params.userId);
  }
  if (!user) {
    return next(new ErrorResponse('No user exists with that user id', 404));
  }
  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc      Update user
// @route     PUT /api/v1/users/:userId
// @access    Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const id = req.params.userId;
  let user;
  if (String(id).length <= 14) {
    user = await User.findOne({ nitmId: req.params.userId });
  } else {
    user = await User.findById(req.params.userId);
  }

  if (!user) {
    return next(
      new ErrorResponse(`No user with the id of ${req.params.userId}`),
      404
    );
  }

  user = await User.findByIdAndUpdate(user._id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc      Delete user
// @route     DELETE /api/v1/users/:userId
// @access    Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const id = req.params.userId;
  let user;
  if (String(id).length <= 14) {
    user = await User.findOne({ nitmId: req.params.userId });
  } else {
    user = await User.findById(req.params.userId);
  }

  if (!user) {
    return next(
      new ErrorResponse(`No user with the id of ${req.params.userId}`),
      404
    );
  }
  await user.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});
