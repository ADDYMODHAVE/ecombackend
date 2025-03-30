const User = require("../../models/user");
const { response } = require("../../helper/common");
const { hashPassword, comparePassword, genJsonWebToken, decodeJsonWebToken } = require("../../helper/secure");
const Company = require("../../models/company");

const userController = {
  // Signup
  signup: async (req, res) => {
    try {
      const { name, email, phone, password, company_id } = req.body;

      // Validate company_id
      if (!company_id) {
        return res.status(400).json(response(null, 0, "Company ID is required"));
      }

      // Check if company exists and is active
      const company = await Company.findOne({
        _id: company_id,
        is_deleted: false,
        is_active: true,
      });

      if (!company) {
        return res.status(404).json(response(null, 0, "Company not found or inactive"));
      }

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { phone }],
        is_deleted: false,
      });

      if (existingUser) {
        return res.status(400).json(response(null, 0, "User already exists"));
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user with static OTP
      const user = await User.create({
        name,
        email,
        phone,
        password: hashedPassword,
        company_id,
        verification_otp: "123456",
        verification_otp_expiry: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        is_active: true,
        is_deleted: false,
      });

      return res.status(201).json(
        response(
          {
            user_id: user._id,
            company_id: user.company_id,
            message: "Please verify your account with OTP: 123456",
          },
          1,
          "User registered successfully"
        )
      );
    } catch (error) {
      return res.status(500).json(response(null, 0, error.message));
    }
  },

  // Verify OTP
  verifyOTP: async (req, res) => {
    try {
      const { user_id, otp } = req.body;

      const user = await User.findOne({
        _id: user_id,
        is_deleted: false,
      });

      if (!user) {
        return res.status(404).json(response(null, 0, "User not found"));
      }

      if (user.verification_otp !== otp) {
        return res.status(400).json(response(null, 0, "Invalid OTP"));
      }

      if (new Date() > user.verification_otp_expiry) {
        return res.status(400).json(response(null, 0, "OTP has expired"));
      }

      user.is_verified = true;
      user.verification_otp = null;
      user.verification_otp_expiry = null;
      await user.save();

      return res.status(200).json(response(null, 1, "Account verified successfully"));
    } catch (error) {
      return res.status(500).json(response(null, 0, error.message));
    }
  },

  // Login
  login: async (req, res) => {
    try {
      const { phone, password } = req.body;

      const user = await User.findOne({
        phone,
        is_deleted: false,
        is_active: true,
      });

      if (!user) {
        return res.status(404).json(response(null, 0, "User not found"));
      }

      if (!user.is_verified) {
        return res.status(403).json(response(null, 0, "Please verify your account first"));
      }

      // Check if company is active
      const company = await Company.findOne({
        _id: user.company_id,
        is_deleted: false,
        is_active: true,
      });

      if (!company) {
        return res.status(403).json(response(null, 0, "Company account is inactive or deleted"));
      }

      const isPasswordValid = await comparePassword(user.password, password);
      if (!isPasswordValid) {
        return res.status(401).json(response(null, 0, "Invalid password"));
      }

      const token = genJsonWebToken({
        _id: user._id,
        company_id: user.company_id,
      });

      return res.status(200).json(
        response(
          {
            user: {
              _id: user._id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              company_id: user.company_id,
              company_name: company.name,
            },
            token,
          },
          1,
          "Login successful"
        )
      );
    } catch (error) {
      return res.status(500).json(response(null, 0, error.message));
    }
  },

  // Forgot Password
  forgotPassword: async (req, res) => {
    try {
      const { contactType, contact, company_id } = req.body;

      if (!contactType || !contact || !company_id) {
        return res.status(400).json(response(null, 0, "Contact type, value, and company ID are required"));
      }

      // Validate company exists and is active
      const company = await Company.findOne({
        _id: company_id,
        is_deleted: false,
        is_active: true,
      });

      if (!company) {
        return res.status(404).json(response(null, 0, "Company not found or inactive"));
      }

      // Validate contact type
      if (!["email", "phone"].includes(contactType)) {
        return res.status(400).json(response(null, 0, "Invalid contact type"));
      }

      // Validate email format if contact type is email
      if (contactType === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(contact)) {
          return res.status(400).json(response(null, 0, "Invalid email format"));
        }
      }

      // Validate phone format if contact type is phone
      if (contactType === "phone") {
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(contact)) {
          return res.status(400).json(response(null, 0, "Invalid phone number format"));
        }
      }

      // Find user by email or phone and company_id
      const user = await User.findOne({
        [contactType]: contact,
        company_id,
        is_deleted: false,
        is_active: true,
      });

      if (!user) {
        return res.status(404).json(response(null, 0, "User not found"));
      }

      // Generate and save OTP
      const resetOTP = "123456"; // For testing, using static OTP
      user.reset_password_otp = resetOTP;
      user.reset_password_otp_expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      await user.save();

      return res.status(200).json(
        response(
          {
            user_id: user._id,
            company_id: user.company_id,
            message: `Reset OTP sent successfully to your ${contactType}. Use 123456 as OTP for testing.`,
          },
          1,
          "Reset OTP sent successfully"
        )
      );
    } catch (error) {
      return res.status(500).json(response(null, 0, error.message));
    }
  },

  // Reset Password
  resetPassword: async (req, res) => {
    try {
      const { user_id, otp, new_password, company_id } = req.body;

      if (!user_id || !otp || !new_password) {
        return res.status(400).json(response(null, 0, "All fields are required"));
      }

      // Find user
      const user = await User.findOne({
        _id: user_id,
        company_id: company_id,
        is_deleted: false,
        is_active: true,
      });

      if (!user) {
        return res.status(404).json(response(null, 0, "User not found"));
      }

      // Verify OTP
      if (user.reset_password_otp !== otp) {
        return res.status(400).json(response(null, 0, "Invalid OTP"));
      }

      // Check OTP expiry
      if (user.reset_password_otp_expiry < Date.now()) {
        return res.status(400).json(response(null, 0, "OTP has expired"));
      }

      // Hash new password
      const hashedPassword = await hashPassword(new_password);

      // Update password and clear OTP
      user.password = hashedPassword;
      user.reset_password_otp = undefined;
      user.reset_password_otp_expiry = undefined;
      await user.save();

      return res.status(200).json(response(null, 1, "Password reset successfully"));
    } catch (error) {
      return res.status(500).json(response(null, 0, error.message));
    }
  },

  // Check Token
  checkToken: async (req, res) => {
    try {

      const token = req.headers.authorization;


      if (!token) {
        return res.status(401).json(response(null, 0, "No token provided"));
      }

      const decoded = decodeJsonWebToken(token);

      if (decoded.exp * 1000 < Date.now()) {
        return res.status(401).json(response(null, 0, "Token has expired"));
      }

      // Find user with company information
      const user = await User.findOne({
        _id: decoded._id,
        is_deleted: false,
        is_active: true,
      });

      if (!user) {
        return res.status(401).json(response(null, 0, "User account is inactive or deleted"));
      }

      // Check if company is active
      const company = await Company.findOne({
        _id: user.company_id,
        is_deleted: false,
        is_active: true,
      });

      if (!company) {
        return res.status(403).json(response(null, 0, "Company account is inactive or deleted"));
      }

      return res.status(200).json(
        response(
          {
            isValid: true,
            user: {
              _id: user._id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              company_id: user.company_id,
              company_name: company.name,
            },
          },
          1,
          "Token is valid"
        )
      );
    } catch (error) {
      return res.status(401).json(response(null, 0, "Invalid token"));
    }
  },

  updatePassword: async (req, res) => {
    try {
      const { user_id, current_password, new_password } = req.body;

      if (!user_id || !current_password || !new_password) {
        return res.status(400).json(response(null, 0, "All fields are required"));
      }

      const user = await User.findOne({
        _id: user_id,
        is_deleted: false,
        is_active: true,
      });

      if (!user) {
        return res.status(404).json(response(null, 0, "User not found or account is inactive"));
      }

      const isPasswordValid = await comparePassword(user.password, current_password);
      if (!isPasswordValid) {
        return res.status(401).json(response(null, 0, "Current password is incorrect"));
      }

      const hashedPassword = await hashPassword(new_password);
      user.password = hashedPassword;
      await user.save();

      return res.status(200).json(response(null, 1, "Password updated successfully"));
    } catch (error) {
      return res.status(500).json(response(null, 0, error.message));
    }
  },
};

module.exports = userController;
