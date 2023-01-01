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
