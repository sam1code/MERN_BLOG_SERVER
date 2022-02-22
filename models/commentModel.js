const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  postId: {
    type: String,
    required: true,
  },
  commentText: {
    type: String,
    required: [true, "plese provide the comment"],
  },
  
});

module.exports = mongoose.model("Comment", commentSchema);
