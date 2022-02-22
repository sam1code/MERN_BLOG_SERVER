const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
  title: {
    type: String,
    required: [true, "please enter product Title"],
    trim: true,
    unique: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  coverImage: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: [true, "please makesure the post is of minimum 100 words."],
    minLength: [300, "please makesure charecter count is more than 300."],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Post", postSchema);
