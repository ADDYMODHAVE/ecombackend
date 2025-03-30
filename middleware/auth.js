const { decodeJsonWebToken } = require('../helper/secure');
const Admin = require('../models/admin');
const Company = require('../models/company');

const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        responseMessage: "No token provided",
        responseCode: 0,
        responseStatus: "Error",
        showMessage: true,
        response: null
      });
    }

    const decoded = decodeJsonWebToken(token);

    // Check if token is expired
    if (decoded.exp * 1000 < Date.now()) {
      return res.status(401).json({
        responseMessage: "Token has expired",
        responseCode: 0,
        responseStatus: "Error",
        showMessage: true,
        response: { isValid: false, isExpired: true }
      });
    }

    // Check if admin exists and is active
    const admin = await Admin.findOne({
      _id: decoded._id,
      is_deleted: false,
      is_active: true
    });

    if (!admin) {
      return res.status(401).json({
        responseMessage: "Admin account is inactive or deleted",
        responseCode: 0,
        responseStatus: "Error",
        showMessage: true,
        response: { isValid: false, isActive: false }
      });
    }

    // Check if company exists and is active
    const company = await Company.findOne({
      _id: admin.company_id,
      is_deleted: false,
      is_active: true
    });

    if (!company) {
      return res.status(401).json({
        responseMessage: "Company account is inactive or deleted",
        responseCode: 0,
        responseStatus: "Error",
        showMessage: true,
        response: { isValid: false, isActive: false }
      });
    }

    // Add admin and company info to request
    req.admin = admin;
    req.company = company;
    next();
  } catch (error) {
    return res.status(401).json({
      responseMessage: "Invalid token",
      responseCode: 0,
      responseStatus: "Error",
      showMessage: true,
      response: { isValid: false }
    });
  }
};

module.exports = verifyToken; 