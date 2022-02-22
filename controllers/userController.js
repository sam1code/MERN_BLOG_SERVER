const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleWare/catchAsyncErrors");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

// 1--> register a user
// 2--> login users
// 3--> logout user
// 4--> forget password(email sending)
// 5--> reset password(updating Password)
// 6--> Get user Detail
// 7--> update User Password
// 8--> update user data

//register a user
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.create(req.body);

  sendToken(user, 200, res);
});

//login users
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
  //checking if user has given password
  if (!email || !password) {
    return next(new ErrorHandler("Enter email and password", 400));
  }

  const user = await User.findOne({ email: email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }
  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }
  sendToken(user, 201, res);
});

// logout user
exports.logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  res.status(200).json({
    success: true,
    message: "logged out successfully",
  });
});

// forget password(email sending)
exports.forgetPassword = catchAsyncErrors(async (req, res, next) => {
  if (!req.body.email) {
    return next(new ErrorHandler("No email recieved", 401));
  }
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // get reset password token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/password/reset/${resetToken}`;

  const message = ` your password request token is :- \n\n ${resetPasswordUrl} \n\n If you have not requested this then, please ignore it`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Blog User Password Recovery`,
      message,
    });
    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully.`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    return next(new ErrorHandler(error.message, 500));
  }
});

// reset password(updating Password)
exports.resetPassword = async (req, res, next) => {

  if (!req.body.password || !req.body.confirmPassword) {
    return next(
      new ErrorHandler("provide password as well as confirm password", 400)
    );
  }
  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Confirm Password does not match", 400));
  }
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler("Reset Password Link is invalid or expired", 400)
    );
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  try {
    await user.save();
  } catch (error) {
    console.log(error);
  }
  sendToken(user, 201, res);
};

// Get user Detail
exports.getUserDetail = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

//update User Password
exports.updateUserPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  const { oldPassword, newPassword, confirmPassword } = req.body;
  if (!oldPassword || !newPassword || !confirmPassword) {
    return next(
      new ErrorHandler(
        "Please provide all fields : oldPassword,newPassword,confirmPassword",
        400
      )
    );
  }
  if (newPassword !== confirmPassword) {
    return next(
      new ErrorHandler("new password and Confirm password must be same", 400)
    );
  }
  if (oldPassword === newPassword) {
    return next(new ErrorHandler("can not use the old password again", 400));
  }

  const isPasswordMatched = await user.comparePassword(oldPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Incorrect old password", 400));
  }

  user.password = newPassword;

  await user.save();

  sendToken(user, 200, res);
});

// update user data
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    fullName: req.body.fullName,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});
