
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
/**
 * Event Schema
 */
const TicketSchema = new mongoose.Schema({
  serialName: {
    type: String,
    required: true,
    index: { unique: true } 
  },
  merchant: { type: Schema.Types.ObjectId, ref: 'Merchant' },
  event: { type: Schema.Types.ObjectId, ref: 'Event' },
  publicKey: {type: String, required: true},
  privateKey: {type: String, required: true},
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
TicketSchema.method({
});

/**
 * Statics
 */
TicketSchema.statics = {
  /**
   * Get user
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */


  
};

const Ticket = mongoose.model('Ticket', TicketSchema);

module.exports = Ticket;
