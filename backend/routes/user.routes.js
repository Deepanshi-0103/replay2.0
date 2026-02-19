import express from "express";
import { body } from "express-validator";
import * as userController from "../controllers/user.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
// import { resetPassword, sendOTP, verifyOTP } from '../controllers/auth.controller.js';

const router = express.Router();

router.post(
  "/register",
  [
    body("fullname.firstname")
      .notEmpty()
      .withMessage("First name is required")
      .isLength({ min: 3 })
      .withMessage("First name must be at least 3 characters long"),
    body("fullname.lastname")
      .notEmpty()
      .withMessage("Last name is required")
      .isLength({ min: 3 })
      .withMessage("Last name must be at least 3 characters long"),
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email address"),
    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long"),
  ],
  userController.registerUser,
);

router.post(
  "/login",
  [
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email address"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  userController.loginUser,
);

router.get("/me", authMiddleware, userController.getMe);

router.post("/logout", authMiddleware, userController.logoutUser);

router.put("/update", authMiddleware, userController.updateUser);

// Google login route
router.post("/google-login", userController.googleLogin);

export default router;
