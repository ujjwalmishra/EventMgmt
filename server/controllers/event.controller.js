import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import config from '../../config/config';
import Merchant from '../models/merchant.model';
import Event from '../models/event.model';
import Item from '../models/items.model';
import nodemailer from 'nodemailer';
import async from 'async';
import crypto from 'crypto';
import path from 'path';


function createEvent(req, res, next) {
    
    const event = new Event({
        eventName: req.body.eventName,
        merchant: req.session.merchant._id,
        eventStartTime: req.body.eventStartTime,
        eventEndTime: req.body.eventEndTime,
        eventVenue: req.body.eventVenue,
        ticketCategory: req.body.ticketCategory,
        eventDescription: req.body.eventDescription,
        ticketCount: req.body.ticketCount,
        createdAt: req.body.createdAt
    });
    event.save()
      .then(eventObj => {
          Merchant.findByIdAndUpdate({_id:req.session.merchant._id},{$push: {events: eventObj._id}})
            .exec().then(merchObj => {
              res.json({"message":"Event saved", "eventId": eventObj._id});
            })
            //todo add organizer details in merchant/event
            .catch(e => {
                console.log(e);
                Event.find({ _id: eventObj._id }).remove()
                 .exec().then(obj => res.json({"message":"Event update to merchant failed"}))
                 .catch(e => res.json({"message":"contact administrator"}));
            })
      })
      .catch(e => 
        {   console.log(e);
            res.json({"message": "Event save failed"})})
    }
    
function updateMerchant(req, res, next) {
  Merchant.findByIdAndUpdate(req.body.id, { $set: { 
    email: req.body.email,
    password: req.body.password,
    company: req.body.company,
    mobileNumber: req.body.mobileNumber,
    userCount: req.body.userCount,
    eventCount: req.body.eventCount
  }}, { new: true }, function (err, merchant) {
    if (err) return next(err);
    res.send(merchant);
  });
}
    
function deleteMerchant(req, res, next) {
  const merchantId = req.body.merchantId;
  if(merchantId == null) {
    const err = new APIError('Provide a id!', httpStatus.NOT_FOUND);
    return next(err); 
  }
  Merchant.find({ _id: merchantId })
  .remove()
  .exec()
  .then(deletedMerchant => {
    Admin.findOne({username: req.user.username})
    .exec()
    .then((admin) => {
      admin.merchants.pull(merchantId);
      admin.save()
      .then(admin => res.json(deletedMerchant))
      .catch(e => next(e));
    })
  })
  .catch(e => next(e))
}
    
function getMerchants(req, res, next) {
  const { limit = 50, skip = 0 } = req.query;
  Merchant.list({ limit, skip })
    .then(merchants => res.json(merchants))
    .catch(e => next(e));
}


function getEvent() {

  Item.list({_id: req.params.eventId })
    .then(items => res.json(items))
    .catch(e => next(e));

}



 export default { createEvent, getEvent};