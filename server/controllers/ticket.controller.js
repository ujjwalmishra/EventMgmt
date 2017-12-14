import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import config from '../../config/config';
import Ticket from '../models/ticket.model';
import Order from '../models/order.model';
import Item from '../models/item.model';
import qrgen from '../qrcodes/qrcodegenerator';
import Transaction from 'mongoose-transactions';



function getOrders(req, res, next) {

    Order.list({ req.params.ticketId })
    .then(orders => res.json(orders))
    .catch(e => next(e));

}

function buyItems(req, res, next) {

  let updatedCredit;

  Ticket.find({_id: ticketId}).exec()
  .then(ticket => {
    if(ticket.totalCredit - req.body.purchaseAmount < 0) {
      const err = new APIError('Invalid purchase amount',  httpStatus.OK);
      return next(err);
    }
    else {
      updatedCredit = ticket.totalCredit - req.body.purchaseAmount;
    }
  });

  const transaction = new Transaction();

  const ticketObj = { 
      $set:{
        totalCredit: updatedCredit
      }
  };
  const orderObj = {
    merchant: req.session.merchant._id,
    event: req.body.eventId,
    ticket: req.body.ticketId,
    items: req.body.items
  };
  const itemArray = req.body.items;


  async function start () {
    try {

        transaction.update('Ticket', req.body.ticketId, ticketObj, {new: true});
        const orderId = transaction.insert('Order', orderObj);
        itemArray.forEach((elem) => {
        
          let itemObj = {
            itemCount: elem.updatedItemCount;  // right now invenotry is unlimited, but in limited invenroty case need to check avaialable qty before proceeding further. Items might have sold out and invenorty is 0
          };

          transaction.update('Item', elem.itemId, itemObj);

        });
        const final = await transaction.run()
        // expect(final[0].name).toBe('Jonathan')
    } catch (error) {
        console.error(error)
        const rollbackObj = await transaction.rollback().catch(console.error)
        transaction.clean();
    }
  }

  start();

}


function buyCredit(req, res, next) {

  Ticket.findOneAndUpdate({_id : req.body.ticketId}, {$inc : {'totalCredit' : req.body.topUpAmount}}).exec()
  .then(() => res.json({"msg": "updated succuessfully"}))
  .catch((e) => next(e));

}

function generateTickets(req, res, next) {

  const ticketCount = req.body.ticketCount;
  const tickets = qrgen.generateTickets(ticketCount); // return public private keys 
  const ticketQrs = qrgen.generateQR(tickets); // return QR images path

  //generate ticket documents
   arr = [{ name: 'Star Wars' }, { name: 'The Empire Strikes Back' }];
Movies.insertMany(arr, function(error, docs) {});

}



 export default { getOrders, buyItems, buyCredit};