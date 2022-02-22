const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const JWT = require("jsonwebtoken");
const User = require("../models/userModel");

// authenticated or not check assigning req.user to user
exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;
  if (!req.cookies) {
    return next(new ErrorHandler("Please login to access this resourse", 401));
  }
  const decodedData = JWT.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decodedData.id);
  next();
});
