
const mongoose = require('mongoose');
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
  merchant: { type: Schema.Types.ObjectId, ref: 'Merchant' },
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
  /**
   * Get user
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */


  
};

const Event = mongoose.model('Event', EventSchema);

module.exports = Event;
