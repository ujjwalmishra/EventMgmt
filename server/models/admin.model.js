import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import bcrypt from 'bcrypt';
import Merchant from './merchant.model';

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
 AdminSchema.pre('save', function save(next) {

  const admin = this;
  if (!admin.isModified('password')) { 
    return next(); }

  bcrypt.genSalt(10, (err, salt) => {
    if (err) { 
      console.log("2ndt");
      return next(err); }

    bcrypt.hash(admin.password, salt).then(function(hash) {
    // Store hash in your password DB.
      admin.password = hash;
      console.log("1st");
      next();
    })
    .catch(() => next(err));

  });
});

/**
 * Methods
 */
AdminSchema.method({
  comparePassword(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
      cb(err, isMatch);
    })
  }
});

/**
 * Statics
 */
AdminSchema.statics = {
  /**
   * Get admin
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then((admin) => {
        if (admin) {
          return admin;
        }
        const err = new APIError('No such user exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  }
};

/**
 * @typedef User
 */
export default mongoose.model('Admin', AdminSchema);
