const { decodeJsonWebToken } = require('../helper/secure');
const Admin = require('../models/admin');

const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                responseMessage: "Token not provided",
                responseCode: 0,
                responseStatus: "Error",
                showMessage: true,
                response: null
            });
        }

        const decoded = decodeJsonWebToken(token);
        const admin = await Admin.findOne({ _id: decoded._id, is_deleted: false });
        
        if (!admin) {
            return res.status(401).json({
                responseMessage: "Invalid token",
                responseCode: 0,
                responseStatus: "Error",
                showMessage: true,
                response: null
            });
        }

        req.admin = admin;
        next();
    } catch (error) {
        return res.status(401).json({
            responseMessage: "Invalid token",
            responseCode: 0,
            responseStatus: "Error",
            showMessage: true,
            response: null
        });
    }
};

module.exports = { verifyToken }; 