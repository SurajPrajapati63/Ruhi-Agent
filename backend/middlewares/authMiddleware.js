const jwt = require("jsonwebtoken");

const authMiddleware = async (
  req,
  res,
  next
) => {

  try {

    // Get token from cookies
    const token =
      req.cookies.token;

    // Check token
    if (!token) {

      return res.status(401).json({

        success: false,

        message: "Unauthorized"

      });

    }

    // Verify token
    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    // Save user data in request
    req.user = decoded;

    next();

  }

  catch (error) {

    return res.status(401).json({

      success: false,

      message: "Invalid Token"

    });

  }

};

module.exports = authMiddleware;