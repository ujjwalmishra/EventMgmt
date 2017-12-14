import express from 'express';
import validate from 'express-validation';
import paramValidation from '../../config/param-validation';
import expressJwt from 'express-jwt';
import config from '../../config/config';
import ticketCtrl from '../controllers/ticket.controller';


const router = express.Router(); // eslint-disable-line new-cap

router.route('/getItems')
/** GET /api/ticket/getItems - get items avaialable for purchase */
.get(expressJwt({ secret: config.jwtSecret }), ticketCtrl.getItems);

router.route('/getOrders')
/** GET /api/ticket/getOrders - get past orders */
.get(expressJwt({ secret: config.jwtSecret }), ticketCtrl.getOrders);

router.route('/buyItems')
.post(expressJwt({ secret: config.jwtSecret }), ticketCtrl.buyItems);

router.route('/buyCredit')
.post(expressJwt({ secret: config.jwtSecret }), ticketCtrl.buyCredit);


export default router;