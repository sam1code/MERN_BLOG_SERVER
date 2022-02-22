const {
  registerUser,
  loginUser,
  logout,
  forgetPassword,
  resetPassword,
  getUserDetail,
  updateUserPassword,
  updateProfile,
} = require("../controllers/userController");
const { isAuthenticatedUser } = require("../middleWare/Auth");

const router = require("express").Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", isAuthenticatedUser, getUserDetail);
router.put("/password/update", isAuthenticatedUser, updateUserPassword);
router.put("/me/update", isAuthenticatedUser, updateProfile);
router.get("/logout", logout);
router.post("/password/forgot", forgetPassword);
router.put("/password/reset/:token", resetPassword);

module.exports = router;
