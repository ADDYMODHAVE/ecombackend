const User = require("../models/user");
const { response } = require("../helper/common");
const { decodeJsonWebToken } = require("../helper/secure");

const authenticateUser = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json(response(null, 0, "No token provided"));
    }

    // Decode and verify token
    const decoded = decodeJsonWebToken(token);

    // Check if token is expired
    if (decoded.expired) {
      return res.status(401).json(response(null, 0, "Token has expired"));
    }

    // Find user and check if active
    const user = await User.findOne({
      _id: decoded._id,
      is_deleted: false,
      is_active: true,
    });

    if (!user) {
      return res.status(401).json(response(null, 0, "User account is inactive or deleted"));
    }

    // Add user information to request object
    req.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      company_id: user.company_id,
      is_verified: user.is_verified,
      is_active: user.is_active,
    };

    next();
  } catch (error) {
    return res.status(401).json(response(null, 0, "Invalid token"));
  }
};

module.exports = {
  authenticateUser,
};
