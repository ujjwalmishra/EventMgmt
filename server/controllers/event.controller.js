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
              res.json({"success":"Event saved", "eventId": eventObj._id});
            })
            //todo add organizer details in merchant/event
            .catch(e => {
                console.log(e);
                Event.find({ _id: eventObj._id }).remove()
                 .exec().then(obj => next(new APIError('Update Event to Merachnt Failed!', httpStatus.OK, true)))
                 .catch(e => next(new APIError('Contact Admin!', httpStatus.OK, true)));
            })
      })
      .catch(e => 
        {   
            next(new APIError('Create Event Failed!', httpStatus.OK, true))})
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
    .catch(e => next(new APIError('Update Event Failed!', httpStatus.OK, true)))
}
    
function deleteEvent(req, res, next) {
  
    const eventName = req.body.eventName;
    if(eventName == null || eventName == undefined){
      const err = new APIError('Provide an event name!!', httpStatus.OK, true);
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
                Merchant.findOneAndUpdate({_id:req.session.merchant._id}, {$pull : {"events" : eventObj._id}}, { new: true })
                  .exec()
                  .then(merchantObj => res.json({"success":"Removed event "+eventObj.eventName+" from merchant "+merchantObj.email}))
                  .catch(e => {
                    const event = new Event(eventObj);
                    event.save()
                    .then(savedEventObj => res.json({"message":"Event not deleted"}))
                    .catch(e => next(new APIError('Event Delete Failed 1!', httpStatus.OK, true)))
                  })
            })
            .catch(e => next(new APIError('Event Delete Failed 2!', httpStatus.OK, true)))
        }
        })
        .catch(e => next(new APIError('Event Doesn\'t Exist!', httpStatus.OK, true)))
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