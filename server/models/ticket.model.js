import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';

const Schema = mongoose.Schema;
/**
 * Ticket Schema
 */
const TicketSchema = new mongoose.Schema({
  merchant: { 
    type: Schema.Types.ObjectId, 
    ref: 'Merchant' 
  },
  event: { 
    type: Schema.Types.ObjectId, 
    ref: 'Event' 
  },
  totalCredit: Number,
  creditHistory: { type : Array , "default" : [] }, //array of all credit addition {time, amount}
  qrCodePath: String,
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
