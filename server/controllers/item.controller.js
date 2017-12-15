import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import config from '../../config/config';
import Ticket from '../models/ticket.model';
import Order from '../models/orders.model';
import Item from '../models/items.model';
import multer from 'multer';


const Storage = multer.diskStorage({
     destination: function(req, file, callback) {
         callback(null, "./Images");
     },
     filename: function(req, file, callback) {
         callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
     }
 });

const upload = multer({
     storage: Storage
 }).single("itemImage");

function addItem(req, res, next) {
  const status = {};
  upload(req, res, function(err) {
    if(err) {
      console.log(err);
      status.img = "failed";
    }
    else {
      status.img = "pass";
        const item = new Item({
          itemName: req.body.itemName,
          merchant: req.session.merchant._id,
          event: req.body.eventId,
          itemPrice: req.body.price,
          itemImage: req.file.filename,
          itemCount: req.body.quantity
        });

        item.save()
        .then(item => {
          res.json({"img": status, "data": "OK" });
        })
        .catch( (e) => 
          {console.log(e);next(e);})
    }

  });

}

function getOrders(req, res, next) {

    Order.list({ _id: req.params.ticketId })
    .then(orders => res.json(orders))
    .catch(e => next(e));

}



 export default { addItem };