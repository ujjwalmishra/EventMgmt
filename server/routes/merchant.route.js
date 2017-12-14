import express from 'express';
import validate from 'express-validation';
import paramValidation from '../../config/param-validation';
import expressJwt from 'express-jwt';
import config from '../../config/config';
import merchantCtrl from '../controllers/merchant.controller';
import eventCtrl from '../controllers/event.controller';
import ticketCtrl from '../controllers/ticket.controller'


const router = express.Router(); // eslint-disable-line new-cap

router.route('/login')
/** POST /api/merchant/login - login admin */
.post(merchantCtrl.login);

router.route('/profile')
/** get /api/merchant/profile - merchant profile */
.get(expressJwt({ secret: config.jwtSecret }), merchantCtrl.profile);

router.route('/profile')
/** POST /api/merchant/profile/update - merchant profile update */
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
.post(expressJwt({ secret: config.jwtSecret }), eventCtrl.createEvent);

//Select a event from list for mobile app
//returns json for items in event
router.route('/select/event/:eventId')
.get(expressJwt({ secret: config.jwtSecret }), eventCtrl.getEvent);

//generate QR codes for a event
router.route('/generateTickets')
.post(expressJwt({ secret: config.jwtSecret }), ticketCtrl.generateTickets);


export default router;