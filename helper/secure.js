const jwt = require("jsonwebtoken");
const cryptoJS = require("crypto-js");
const bcryptJS = require("bcryptjs");

module.exports = {
  genJsonWebToken: (jsondata) => {
    const jsonToken = jwt.sign(jsondata, process.env.JWT_SECRET_KEY, { expiresIn: "24h" });
    const encryptToken = cryptoJS.AES.encrypt(jsonToken, process.env.CRYPTO_SECRET_KEY).toString();
    const actualToken = encryptToken.replace(/\//g, "-");
    return actualToken;
  },
  decodeJsonWebToken: (token) => {
    try {
      const actualToken = token.replace(/-/g, "/");
      const bytes = cryptoJS.AES.decrypt(actualToken, process.env.CRYPTO_SECRET_KEY);
      const decryptToken = bytes.toString(cryptoJS.enc.Utf8);
      const data = jwt.verify(decryptToken, process.env.JWT_SECRET_KEY);
      return { _id: data._id, exp: data.exp };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        // Return a special object for expired tokens
        return { expired: true, exp: error.expiredAt };
      }
      // Re-throw other errors
      throw error;
    }
  },
  hashPassword: async (password) => {
    const hashPass = await bcryptJS.hash(password, Number(process.env.BCRYPT_SALT_ROUND));
    return hashPass;
  },
  comparePassword: async (hash, password) => {
    return await bcryptJS.compare(password, hash);
  },
  genrateOtp: () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  },
};
