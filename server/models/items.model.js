import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';

const Schema = mongoose.Schema;
/**
 * Event Schema
 */
const ItemSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true
  },
  merchant: { 
    type: Schema.Types.ObjectId, 
    ref: 'Merchant' 
  },
  event: {
    type: Schema.Types.ObjectId, 
    ref: 'Event'
  },
  itemPrice: {
    type: Number,
    required: true
  },
  itemImage: String,
  itemCount: Number,
  createdAt: {
    type: Date,
    default: Date.now
  },
  modifiedAt: {
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
ItemSchema.method({
});

/**
 * Statics
 */
ItemSchema.statics = {

    /**
   * List items for a event in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of items to be skipped.
   * @param {number} limit - Limit number of itemss to be returned.
   * @returns {Promise<Item[]>}
   */
  list({eventId, skip = 0, limit = 50 } = {}) {
    return this.find({event: eventId})
      .sort({ createdAt: -1 })
      .skip(+skip)
      .limit(+limit)
      .exec();
  }

};

/**
 * @typedef Event
 */
export default mongoose.model('Item', ItemSchema);
