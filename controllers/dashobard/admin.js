const Admin = require("../../models/admin");
const Company = require("../../models/company");
const { response } = require("../../helper/common");
const { hashPassword, comparePassword, genJsonWebToken, decodeJsonWebToken } = require("../../helper/secure");

const adminController = {
  register: async (req, res) => {
    try {
      const { company_name, company_email, company_phone, company_address, admin_name, admin_email, admin_password } = req.body;

      if (!company_name || !company_email || !admin_name || !admin_email || !admin_password) {
        return res.status(400).json(response(null, 0, "All fields are required"));
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(company_email) || !emailRegex.test(admin_email)) {
        return res.status(400).json(response(null, 0, "Invalid email format"));
      }
      const existingCompany = await Company.findOne({
        email: company_email,
        is_deleted: false
      });
      if (existingCompany) {
        return res.status(400).json(response(null, 0, "Company email already exists"));
      }
      const existingAdmin = await Admin.findOne({
        email: admin_email,
        is_deleted: false
      });
      if (existingAdmin) {
        return res.status(400).json(response(null, 0, "Admin email already exists"));
      }
      if (admin_password.length < 8) {
        return res.status(400).json(response(null, 0, "Password must be at least 8 characters long"));
      }
      const company = await Company.create({
        name: company_name,
        email: company_email,
        phone: company_phone,
        address: company_address,
        is_active: true,
        is_deleted: false
      });
      const hashedPassword = await hashPassword(admin_password);

      const admin = await Admin.create({
        name: admin_name,
        email: admin_email,
        password: hashedPassword,
        company_id: company._id,
        is_active: true,
        is_deleted: false
      });

      return res.status(201).json(response(admin, 1, "Admin registered successfully"));
    } catch (error) {
      return res.status(500).json(response(null, 0, error.message));
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json(response(null, 0, "Email and password are required"));
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json(response(null, 0, "Invalid email format"));
      }

      const admin = await Admin.findOne({
        email,
        is_deleted: false,
        is_active: true
      });

      if (!admin) {
        return res.status(404).json(response(null, 0, "Admin not found or account is inactive"));
      }

      const company = await Company.findOne({
        _id: admin.company_id,
        is_deleted: false,
        is_active: true
      });

      if (!company) {
        return res.status(403).json(response(null, 0, "Company account is inactive or deleted"));
      }

      const isPasswordValid = await comparePassword(admin.password, password);
      if (!isPasswordValid) {
        return res.status(401).json(response(null, 0, "Invalid password"));
      }

      const token = genJsonWebToken({ _id: admin._id });

      return res.status(200).json(
        response(
          {
            admin: {
              _id: admin._id,
              name: admin.name,
              email: admin.email,
              is_active: admin.is_active
            },
            company: {
              _id: company._id,
              name: company.name,
              email: company.email,
              is_active: company.is_active
            },
            token,
            expiresIn: '24h'
          },
          1,
          "Login successful"
        )
      );
    } catch (error) {
      return res.status(500).json(response(null, 0, error.message));
    }
  },

  checkToken: async (req, res) => {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json(response(null, 0, "Token is required"));
      }
      const decoded = decodeJsonWebToken(token);

      if (decoded.exp * 1000 < Date.now()) {
        return res.status(401).json(response({ isValid: false, isExpired: true }, 0, "Token has expired"));
      }

      const admin = await Admin.findOne({
        _id: decoded._id,
        is_deleted: false,
        is_active: true
      });

      if (!admin) {
        return res.status(401).json(response({ isValid: false, isActive: false }, 0, "Admin account is inactive or deleted"));
      }

      const company = await Company.findOne({
        _id: admin.company_id,
        is_deleted: false,
        is_active: true
      });

      if (!company) {
        return res.status(401).json(response({ isValid: false, isActive: false }, 0, "Company account is inactive or deleted"));
      }

      return res.status(200).json(response({ 
        isValid: true,
        isActive: true,
        expiresIn: new Date(decoded.exp * 1000).toISOString()
      }, 1, "Token is valid"));
    } catch (error) {
      return res.status(401).json(response({ isValid: false }, 0, "Invalid token"));
    }
  },
};

module.exports = adminController;
