import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
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
  tokens: Array,
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
    location: String,
    website: String,
    picture: String
  }
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */
MerchantSchema.method({
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
