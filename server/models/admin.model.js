import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';

const Schema = mongoose.Schema;
/**
 * Admin Schema
 */
const AdminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  mobileNumber: {
    type: String,
    match: [/^[1-9][0-9]{9}$/, 'The value of path {PATH} ({VALUE}) is not a valid mobile number.']
  },
  merchants: [
  {
    type: Schema.Types.ObjectId, 
    ref: 'Merchant' 
  }
  ],
  createdAt: {
    type: Date,
    default: Date.now
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
AdminSchema.method({
});

/**
 * Statics
 */
AdminSchema.statics = {

};

/**
 * @typedef User
 */
export default mongoose.model('Admin', AdminSchema);
