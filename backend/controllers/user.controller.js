import userModel from "../models/user.model.js";
import userService from "../services/user.service.js";
import { validationResult } from "express-validator";
import BlacklistToken from "../models/blacklistToken.model.js";
import bcrypt from "bcrypt";

export const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { fullname, email, password, role } = req.body;

  const existingEmail = await userModel.findOne({ email });
  if (existingEmail) {
    return res.status(400).json({ message: "Email already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await userService.createUser({
    fullname: {
      firstname: fullname.firstname,
      lastname: fullname.lastname,
    },
    email,
    password: hashedPassword,
    role,
  });

  const token = user.generateAuthToken();

  res.cookie("token", token, {
    httpOnly: true,
    secure: false, // Set to true in production
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 365 * 5,
  });

  res.status(201).json({ token, user });
};

export const loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ message: "Invalid email or password", errors: errors.array() });
  }

  const { email, password } = req.body;

  const user = await userModel.findOne({ email }).select("+password");

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = user.generateAuthToken();

  res.cookie("token", token, {
    httpOnly: true,
    secure: true, // Should be true if using sameSite='none'
    sameSite: "none",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000 * 365 * 5,
  });

  res.status(200).json({ token, user });
};

export const logoutUser = async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (token) {
    await BlacklistToken.create({ token });
  }

  res.status(200).json({ message: "Logged out successfully" });
};

export const getMe = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { fullname, email, avatar } = req.body;
    const updateData = {};

    if (fullname) {
      if (fullname.firstname)
        updateData["fullname.firstname"] = fullname.firstname;
      if (fullname.lastname)
        updateData["fullname.lastname"] = fullname.lastname;
    }
    if (email) updateData.email = email;
    if (avatar) updateData.avatar = avatar;

    const user = await userModel.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true },
    );

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { email, name, picture, googleId } = req.body;

    // Check if user exists
    let user = await userModel.findOne({ email });

    if (!user) {
      // Create new user if doesn't exist
      const [firstname, ...lastnameParts] = name.split(" ");
      const lastname = lastnameParts.join(" ");

      user = await userService.createUser({
        fullname: {
          firstname,
          lastname: lastname || "",
        },
        email,
        password: Math.random().toString(36).slice(-8), // Random password for Google users
        role: "user",
        avatar: picture,
        googleId,
      });
    } else if (!user.googleId) {
      // Update existing user with Google ID if not already set
      user.googleId = googleId;
      if (!user.avatar) {
        user.avatar = picture;
      }
      await user.save();
    }

    const token = user.generateAuthToken();
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 1000 * 60 * 60 * 24 * 365 * 5, // 5 year
    });
    res.status(200).json({ token, user });
  } catch (error) {
    console.error("Google login error:", error);
    res
      .status(500)
      .json({ message: "Error during Google login", error: error.message });
  }
};
