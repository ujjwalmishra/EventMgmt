import express from 'express';
import validate from 'express-validation';
import paramValidation from '../../config/param-validation';
import expressJwt from 'express-jwt';
import config from '../../config/config';
import merchantCtrl from '../controllers/merchant.controller';

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

export default router;