import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import bcrypt from 'bcrypt';
import APIError from '../helpers/APIError';
const Schema = mongoose.Schema;
/**
 * Merchant Schema
 */
const MerchantSchema = new mongoose.Schema({
  email: { 
    type: String, 
    unique: true,
    required: true
  },
  password:{
    type: String,
    required: true
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  company: {
    type:String,
    required: true
  }, 
  mobileNumber: {
    type: String,
    match: [/^[1-9][0-9]{9}$/, 'The value of path {PATH} ({VALUE}) is not a valid mobile number.']
  },
  userCount: Number,
  eventCount: Number,
  address: String,
  events: [
    { type: Schema.Types.ObjectId, ref: 'Event' }
  ],
  profile: {
    name: String,
    contact: {
      type: String
    }
  }
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

MerchantSchema.pre('save', function save(next) {
  
    const merchant = this;
    if (!merchant.isModified('password')) { 
      return next(); }
  
    bcrypt.genSalt(10, (err, salt) => {
      if (err) { 
        console.log("2nd");
        return next(err); }
  
      bcrypt.hash(merchant.password, salt).then(function(hash) {
      // Store hash in your password DB.
        merchant.password = hash;
        console.log("1st");
        next();
      })
      .catch(() => next(err));
  
    });
  });

/**
 * Methods
 */
MerchantSchema.method({
  comparePassword(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
      cb(err, isMatch);
    })
  }
});

/**
 * Statics
 */
MerchantSchema.statics = {

  /**
   * List users in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of users to be skipped.
   * @param {number} limit - Limit number of users to be returned.
   * @returns {Promise<User[]>}
   */
  list({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .sort({ createdAt: -1 })
      .skip(+skip)
      .limit(+limit)
      .exec();
  }

};

/**
 * @typedef Merchant
 */
export default mongoose.model('Merchant', MerchantSchema);
