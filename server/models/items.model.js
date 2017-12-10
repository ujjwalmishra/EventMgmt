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
    required: true,
    index: { unique: true } 
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

};

/**
 * @typedef Event
 */
export default mongoose.model('Item', ItemSchema);
