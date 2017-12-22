import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import APIError from '../helpers/APIError';
import config from '../../config/config';
import Event from '../models/event.model';
import Ticket from '../models/ticket.model';
import Order from '../models/orders.model';
import Item from '../models/items.model';
import qrgen from '../qrcodes/qrcodegenerator'
import async from 'async';


function getOrders(req, res, next) {

    Order.list({ _id: req.params.ticketId })
    .then(orders => res.json(orders))
    .catch(e => next(e));

}

function buyItems(req, res, next) {

  let updatedCredit;

  Ticket.findOne({privateKey: req.body.secret}).exec()
  .then(ticket => {
    if(ticket.totalCredit - req.body.purchaseAmount < 0) {
      const err = new APIError('Invalid purchase amount',  httpStatus.OK);
      return next(err);
    }
    else {
      console.log(ticket.totalCredit);
      updatedCredit = ticket.totalCredit - req.body.purchaseAmount;

      const ticketObj = {  $set:{ totalCredit: updatedCredit  }  };

      Ticket.findByIdAndUpdate(ticket._id, ticketObj, function(err, doc) {
        if(err) {
           return next(err);
        };
    
        const itemArray = req.body.items;
        const order = new Order({
          merchant: doc.merchant,
          event: req.body.eventId,
          ticket: doc._id,
          items: req.body.items         
        });

        order.save()
        .then((order) => {

          let itemUpdateArray = [];
          const itemLength = itemArray.length;
          let count = 0;
          itemArray.forEach(function(elem) {
            console.log(elem);
            Item.findOneAndUpdate({ _id: elem.itemId }, { $inc: { itemCount : -elem.itemCount}, new: true })
            .then((item) => {

              itemUpdateArray.push({"itemId": item._id, "amount": item.itemCount});
       
              count++;
              console.log(itemLength);
              if(count == itemLength) {
                return res.json({"data": itemUpdateArray});
              }
            })
            .catch((e) => {
              console.log(e);
              return next(e);
              //revert all transaction
            });
  
          });

        })
        .catch(e => {
          console.log(e);
          Ticket.findByIdAndUpdate(doc._id, {  $set:{ totalCredit: ticket.totalCredit  }},
          function(err, undoTicket)   {
            return res.json({"msg": "order failed"});
          })
        })      
      })
    }
  })
  .catch((e) => {
    return next(e);
  });


}


function buyCredit(req, res, next) {

  Ticket.findOneAndUpdate({_id : req.body.ticketId}, {$inc : {'totalCredit' : req.body.topUpAmount}}).exec()
  .then(() => res.json({"msg": "updated succuessfully"}))
  .catch((e) => next(e));

}

function generateTickets(req, res, next) {

  const ticketCount = req.body.ticketCount;
  const tickets = qrgen.generateTickets(ticketCount); // return public private keys 
  const ticketQrs = qrgen.generateQR(tickets, req.body.eventId); // return QR images path

  const ticketDocuments = [];
  console.log("Total Credit", req.body.totalCredit);
  for(let i=0; i < tickets.length; i++) {
    tickets[i].qr = ticketQrs[i];
    let ticketDocument = {};
    ticketDocument.merchant = req.session.merchant._id;
    ticketDocument.event = req.body.eventId;
    ticketDocument.totalCredit = req.body.totalCredit ;
    ticketDocument.creditHistory = [ticketDocument.totalCredit];
    ticketDocument.qrCodePath = ticketQrs[i];
    ticketDocument.publicKey = tickets[i].publicKey;
    ticketDocument.privateKey = tickets[i].secretKey;
    ticketDocuments.push(ticketDocument);
  }

  Ticket.insertMany(ticketDocuments, function(error, docs) {
    console.log(error);
    console.log(docs);
    if(error) {
     return next(error);
    };
    res.json({"msg": "Success"});

  });

}

function getTicketId(req, res, next) {

  console.log(req.body.privateKey);

  Ticket.findOne({privateKey : req.body.privateKey})
  .exec()
  .then(ticket => {
    res.json({"ticketId": ticket._id})
  })
  .catch(e => next(e))

}
 

function getQrCodes(req, res, next) {

  return res.json(qrgen.retrieveQr(req.body.eventId, req.body.count));

}


 export default { getOrders, buyItems, buyCredit, generateTickets, getQrCodes, getTicketId};