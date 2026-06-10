const express =
require("express");

const {

  signup,

  login,

  logout,

  getMe

} = require(
  "../controllers/authController"
);

const authMiddleware = require("../middlewares/authMiddleware");

const router =
express.Router();



// Public Routes
router.post(
  "/signup",
  signup
);

router.post(
  "/login",
  login
);



// Protected Routes
router.get(
  "/me",
  authMiddleware,
  getMe
);

router.post(
  "/logout",
  logout
);



module.exports = router;