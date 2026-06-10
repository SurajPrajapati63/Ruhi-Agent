const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const createAuthToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );

const setAuthCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

/*
========================
SIGNUP
========================
*/

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,

        message: "All fields are required",
      });
    }

    // Existing User
    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,

        message: "User already exists",
      });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User
    const user = await User.create({
      name,

      email,

      password: hashedPassword,

      role: "user",
    });

    const token = createAuthToken(user);
    const safeUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      message: "Signup Successful",
      token,
      user: safeUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/*
========================
LOGIN
========================
*/

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,

        message: "All fields are required",
      });
    }

    // Find User
    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(400).json({
        success: false,

        message: "User not found",
      });
    }

    // Compare Password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,

        message: "Invalid Password",
      });
    }

    // Generate JWT
    const token = createAuthToken(user);

    const safeUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    // Cookie
    setAuthCookie(res, token);

    res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      user: safeUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

exports.logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({
      success: true,
      message: "Logout Successful",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
