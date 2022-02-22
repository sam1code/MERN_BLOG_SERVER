const catchAsyncError = require("../middleWare/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const Comment = require("../models/commentModel");
const Post = require("../models/postModel");

// 1--> create a new comment --LOGGED IN
// 2--> update a comment --LOGGED IN
// 3--> delete a comment --LOGGED IN

// create a new comment --LOGGED IN ========
exports.createAnewComment = catchAsyncError(async (req, res, next) => {
  if (!req.body.commentText) {
    return next(new ErrorHandler("provide a commentText", 400));
  }
  const post = await Post.findById(req.body.postId);
  if (!post) {
    return next(new ErrorHandler("post not found", 404));
  }
  const comment = await Comment.create({ ...req.body, user: req.user.id });
  res.status(201).json({ success: true, comment });
});

// Update a comment --LOGGED IN ===========
exports.updateComment = catchAsyncError(async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(
      new ErrorHandler("provide at least one data what you want to update", 400)
    );
  }
  let comment = await Comment.findById(req.params.id).populate("user", "email");

  if (!comment) {
    return next(new ErrorHandler("comment not found", 404));
  }
  if (comment.user.email !== req.user.email) {
    return next(new ErrorHandler("you are not the owner of this comment", 404));
  }
  comment = await Comment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    useFindAndModify: false,
  });

  return res.status(200).send({ success: true, comment });
});

// Delete a comment --LOGGED IN ===============
exports.deleteComment = catchAsyncError(async (req, res, next) => {
  let comment = await Comment.findById(req.params.id).populate("user", "email");
  if (!comment) {
    return next(new ErrorHandler("comment not found", 404));
  }
  if (comment.user.email !== req.user.email) {
    return next(new ErrorHandler("you are not the owner of this comment", 404));
  }
  await comment.remove();
  res
    .status(200)
    .json({ success: true, message: "comment deleted successfully" });
});
