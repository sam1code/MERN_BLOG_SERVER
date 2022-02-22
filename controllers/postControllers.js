const catchAsyncError = require("../middleWare/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const Post = require("../models/postModel");
const Comment = require("../models/commentModel");
const ApiFeatures = require("../utils/apiFeatures");
const client = require("../config/redis");
const cloudinary = require("../config/cloudinary");

// 1--> get all posts
// 2--> get a post
// 3--> create a new post --LOGGED IN
// 4--> update a post --LOGGED IN
// 5--> delete a post --LOGGED IN

// get all post ======================
exports.getAllPosts = catchAsyncError(async (req, res, next) => {
  const postCount = await Post.count();
  const apiFeature = new ApiFeatures(Post.find(), req.query)
    .searchFeature()
    .paginationFeature(process.env.BLOG_PER_PAGE);
  const posts = await apiFeature.query;
  res.status(200).send({ success: true, posts, postCount });
});

// get a post ========================
exports.getAPost = catchAsyncError(async (req, res, next) => {
  //trying to get the cached data
  const getCachedPosts = await client.get(`post-${req.params.id}`);
  const getCachedComments = await client.get(`comments-post-${req.params.id}`);
  if (!getCachedPosts || !getCachedComments) {
    // fetch post
    const post = await Post.findById(req.params.id);
    if (!post) {
      return next(new ErrorHandler("post not found", 404));
    }
    // fetch comments
    const comments = await Comment.find({ postId: req.params.id });

    // caching for 2 minutes
    await client.set(`post-${req.params.id}`, JSON.stringify(post), {
      EX: 60 * 2,
    });
    await client.set(
      `comments-post-${req.params.id}`,
      JSON.stringify(comments),
      { EX: 60 * 2 }
    );
    return res.status(200).send({ success: true, post, comments });
  }
  return res.status(200).send({
    success: true,
    post: JSON.parse(getCachedPosts),
    comments: JSON.parse(getCachedComments),
  });
});

// create a new post --LOGGED IN ========
exports.createAnewPost = catchAsyncError(async (req, res, next) => {
  if (req.body.title.length < 4) {
    return next(new ErrorHandler("title must be more than 4 characters", 400));
  }
  const alreadyExists = await Post.findOne({ title: req.body.title });
  if (alreadyExists) {
    return next(
      new ErrorHandler("Can't create duplicate blog with same title", 400)
    );
  }
  // uploading photo to cloudinary
  const file = req.files.photo;
  cloudinary.uploader.upload(file.tempFilePath, async (err, result) => {
    if (err) {
      return next(new ErrorHandler("Failed to upload photo", 500));
    }

    try {
      const post = await Post.create({
        ...req.body,
        user: req.user.id,
        coverImage: result.url,
      });
      res.status(201).json({ success: true, post });
    } catch (err) {
      return next(
        new ErrorHandler(`this ${Object.keys(err.keyValue)} already exists`)
      );
    }
  });
});

// Update a post --LOGGED IN ===========
exports.updatePost = catchAsyncError(async (req, res, next) => {
  let post = await Post.findById(req.params.id).populate("user", "email");
  console.log(post);
  if (post.user.email !== req.user.email) {
    return next(new ErrorHandler("you are not the owner of this post", 404));
  }
  if (!post) {
    return next(new ErrorHandler("post not found", 404));
  }

  if (Object.keys(req.body).length === 0) {
    return next(
      new ErrorHandler("provide at least one data what you want to update", 400)
    );
  }

  post = await Post.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    useFindAndModify: false,
  });

  return res.status(200).send({ success: true, post });
});

// Delete a post --LOGGED IN ===============
exports.deletePost = catchAsyncError(async (req, res, next) => {
  let post = await Post.findById(req.params.id).populate("user", "email");
  if (post.user.email !== req.user.email) {
    return next(new ErrorHandler("you are not the owner of this post", 404));
  }
  if (!post) {
    return next(new ErrorHandler("post not found", 404));
  }
  await post.remove();
  res.status(200).json({ success: true, message: "post deleted successfully" });
});
