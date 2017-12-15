import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';

const Schema = mongoose.Schema;
/**
 * Event Schema
 */
const EventSchema = new mongoose.Schema({
eventName: {
    type: String,
    required: true,
    index: { unique: true } 
  },
  merchant: { 
    type: Schema.Types.ObjectId, 
    ref: 'Merchant' 
  },
  eventStartTime: Date,
  eventEndTime: Date,
  eventVenue: String,
  ticketCategory: Array,
  eventDescription: String,
  ticketCount: Number,
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
EventSchema.method({
  
});

/**
 * Statics
 */
EventSchema.statics = {

};

/**
 * @typedef Event
 */
export default mongoose.model('Event', EventSchema);
