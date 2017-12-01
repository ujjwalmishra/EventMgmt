import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';

const Schema = mongoose.Schema;
/**
 * Ticket Schema
 */
const TicketSchema = new mongoose.Schema({
  serialName: {
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
  publicKey: {
    type: String, 
    required: true
  },
  privateKey: {
    type: String, 
    required: true
  },
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

};

/**
 * @typedef Ticket
 */
export default mongoose.model('Ticket', TicketSchema);
