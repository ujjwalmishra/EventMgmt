import express from 'express';
import validate from 'express-validation';
import paramValidation from '../../config/param-validation';
import expressJwt from 'express-jwt';
import config from '../../config/config';
import merchantCtrl from '../controllers/merchant.controller';
import eventCtrl from '../controllers/event.controller';
import ticketCtrl from '../controllers/ticket.controller';
import itemCtrl from '../controllers/item.controller';


const router = express.Router(); // eslint-disable-line new-cap

router.route('/login')
/** POST /api/merchant/login - login admin */
.post(merchantCtrl.login);

router.route('/logout')
/** POST /api/merchant/login - login admin */
.get(merchantCtrl.logout);

router.route('/profile')
/** get /api/merchant/profile - merchant profile */
.get(expressJwt({ secret: config.jwtSecret }), merchantCtrl.profile)
/** POST /api/merchant/profile - merchant profile update */
.post(expressJwt({ secret: config.jwtSecret }), merchantCtrl.updateProfile);

router.route('/resetpassword')
/** POST /api/merchant/resetpassword - merchant password reset */
.post(merchantCtrl.resetPasswrdToken);

router.route('/reset/:token')
.get(merchantCtrl.verifyResetToken)
.post(merchantCtrl.resetPassword);

router.route('/updatepassword')
/** POST /api/merchant/updatepassword - merchant password update */
.post(expressJwt({ secret: config.jwtSecret }), merchantCtrl.updatePasswrd);

router.route('/create/event')
/*** POST /api/merchant/create/event - to create a new event */
.post(expressJwt({ secret: config.jwtSecret }), eventCtrl.createEvent);

router.route('/update/event')
/*** POST /api/merchant/update/event - to update an existing event */
.post(expressJwt({ secret: config.jwtSecret }), eventCtrl.updateEvent);

router.route('/delete/event')
/*** POST /api/merchant/update/event - to update an existing event */
.post(expressJwt({ secret: config.jwtSecret }), eventCtrl.deleteEvent);

//Select a event from list for mobile app
//returns json for items in event
router.route('/select/event/:eventId')
.get(expressJwt({ secret: config.jwtSecret }), eventCtrl.getEvent);

//generate QR codes for a event
router.route('/generateTickets')
.post(expressJwt({ secret: config.jwtSecret }), ticketCtrl.generateTickets);

router.route('/getTickets')
.post(expressJwt({ secret: config.jwtSecret }), ticketCtrl.getQrCodes);

//Item routes
router.route('/addItem')
.post(expressJwt({ secret: config.jwtSecret }), itemCtrl.addItem);

router.route('/updateItem')
.post(expressJwt({ secret: config.jwtSecret }), itemCtrl.updateItem);

router.route('/updateItemImage')
.post(expressJwt({ secret: config.jwtSecret }), itemCtrl.uploadImageItem);

router.route('/removeItem')
.post(expressJwt({ secret: config.jwtSecret }), itemCtrl.removeItem );

router.route('/getItems/:eventId')
.get(expressJwt({ secret: config.jwtSecret }), itemCtrl.getItems);


export default router;