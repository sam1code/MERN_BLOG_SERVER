const {
  createAnewComment,
  updateComment,
  deleteComment,
} = require("../controllers/commentController");

const router = require("express").Router();
const { isAuthenticatedUser } = require("../middleWare/Auth");

router
  .post("/create", isAuthenticatedUser, createAnewComment)
  .put("/:id", isAuthenticatedUser, updateComment)
  .delete("/:id", isAuthenticatedUser, deleteComment);

module.exports = router;
