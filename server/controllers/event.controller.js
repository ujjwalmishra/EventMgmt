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
    
function updateEvent(req, res, next) {
  Event.findOneAndUpdate({"eventName":req.body.eventName}, { $set: { 
    eventName: req.body.eventName,
    merchant: req.session.merchant._id,
    eventStartTime: req.body.eventStartTime,
    eventEndTime: req.body.eventEndTime,
    eventVenue: req.body.eventVenue,
    ticketCategory: req.body.ticketCategory,
    eventDescription: req.body.eventDescription,
    ticketCount: req.body.ticketCount,
    createdAt: req.body.createdAt
  }}, { new: true })
    .exec()
    .then(eventObj => res.json(eventObj))
    .catch(e => res.json(e))
}
    
function deleteEvent(req, res, next) {
  
    const eventName = req.body.eventName;
    if(eventName == null || eventName == undefined){
      const err = new APIError('Provide an event name!!', httpStatus.NOT_FOUND);
      return next(err);
    }
    Event.findOne({"eventName" : eventName})
      .exec()
      .then(eventObj => {
        if(eventObj.merchant == req.session.merchant._id)
        {
          Event.remove({"eventName" : eventObj.eventName})
            .exec()
            .then(writeResult => {
              console.log("***********************************************" + eventObj.merchant);
              console.log("***********************************************" + writeResult.nRemoved);
                Merchant.findOneAndUpdate({_id:req.session.merchant._id}, {$pull : {"events" : eventObj._id}}, { new: true })
                  .exec()
                  .then(merchantObj => res.json({"message":"Remove event "+eventObj.eventName+" from merchant "+merchantObj.email}))
                  .catch(e => {
                    const event = new Event(eventObj);
                    event.save()
                    .then(savedEventObj => res.json({"message":"Event not deleted"}))
                    .catch(e => res.json({"message":"Please contact administrator"}))
                  })
            })
            .catch(e => res.json(e))
        }
        })
        .catch(e => res.json(e))
  }
    
function listEvents(req, res, next) {
  let merchantid;
  if(req.body.merchant) {
    merchantid = req.body.merchant;
  }
  else {
    merchantid = req.session.merchant._id;
  }
  console.log(merchantid);
  Event.find({"merchant":merchantid}).exec()
    .then(events => res.json(events))
    .catch(e => next(e));
}


function getEvent() {

  Item.list({_id: req.params.eventId })
    .then(items => res.json(items))
    .catch(e => next(e));

}



 export default { createEvent, updateEvent, deleteEvent, listEvents, getEvent};