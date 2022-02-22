const {
  createAnewPost,
  getAllPosts,
  updatePost,
  getAPost,
  deletePost,
} = require("../controllers/postControllers");
const { isAuthenticatedUser } = require("../middleWare/Auth");

const router = require("express").Router();

router
  .get("/all", getAllPosts)
  .get("/:id", getAPost)
  .post("/create", isAuthenticatedUser, createAnewPost)
  .put("/:id", isAuthenticatedUser, updatePost)
  .delete("/:id", isAuthenticatedUser, deletePost);

module.exports = router;
