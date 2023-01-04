const User = require('../models/User');
const asyncHandler = require('../middlewares/async');

// @desc        Register user
// @route       Get /api/v1/auth/register
// @access      Public
exports.register = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);
  res.status(200).json({
    success: true,
    data: user,
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
