const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  password: {
    type: String
  },
  company_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  verification_otp: {
    type: String
  },
  verification_otp_expiry: {
    type: Date
  },
  reset_password_otp: {
    type: String
  },
  reset_password_otp_expiry: {
    type: Date
  },
  is_verified: {
    type: Boolean,
    default: false
  },
  is_active: {
    type: Boolean,
    default: true
  },
  is_deleted: {
    type: Boolean,
    default: false
  },
  profile_image: {
    type: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    pincode: String
  },
  last_login: {
    type: Date
  },
  device_token: {
    type: String
  }
}, {
  timestamps: true
});

userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ company_id: 1 });
userSchema.index({ is_active: 1, is_deleted: 1 });

module.exports = mongoose.model('User', userSchema); 