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
          res.json({"img": status, "data": item });
        })
        .catch( (e) => 
          {next(e)})
    }

  });

}

function updateItem(req, res, next) {
  const updateObj = req.body.itemUpdate;
  Item.findByIdAndUpdate(req.body.itemId, { $set: updateObj}, {'new': true}, function(err, doc) {
    if(err) {
      res.json({"msg": "failed"})
    }
    res.json(doc);
  });
}

function uploadImageItem(req, res, next) {

  upload(req, res, function(err) {
    if(err) {
      console.log(err);
      res.json({"msg": "failed"})
    }
    else {
        Item.findByIdAndUpdate(req.body.itemId, { $set: {'itemImage' : req.file.filename }}, {'new': true}, function(err, doc) {
          if(err) {
            res.json({"msg": "failed"})
          }
          res.json(doc);
        });
    }

  });


}

function removeItem(req, res, next) {

  Item.findByIdAndRemove(req.body.itemId, function(err, response) {

    if(err) {
      res.json({"msg": "failed"})
    }

    res.json(response);

  })

}

function getItems(req, res, next) {

    Item.list({ _id: req.params.eventId })
    .then(items => res.json(items))
    .catch(e => next(e));

}



 export default { addItem, updateItem, uploadImageItem, removeItem, getItems};