import express from 'express';
import validate from 'express-validation';
import paramValidation from '../../config/param-validation';
import adminCtrl from '../controllers/admin.controller';
import expressJwt from 'express-jwt';
import config from '../../config/config';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  .post(adminCtrl.create);

router.route('/login')
  /** POST /api/admin/login - login admin */
  .post(adminCtrl.login)

router.route('/create/merchant')
  .post(expressJwt({ secret: config.jwtSecret }), adminCtrl.createMerchant);

router.route('/update/merchant')
  .post(expressJwt({ secret: config.jwtSecret }),adminCtrl.updateMerchant);

router.route('/delete/merchant')
  .post(expressJwt({ secret: config.jwtSecret }),adminCtrl.deleteMerchant);

router.route('/list/merchant')
  .get(expressJwt({ secret: config.jwtSecret }), adminCtrl.getMerchants);

// router.route('/:userId')
//   /** GET /api/users/:userId - Get user */
//   .get(userCtrl.get)

//   /** PUT /api/users/:userId - Update user */
//   .put(validate(paramValidation.updateUser), userCtrl.update)

//   /** DELETE /api/users/:userId - Delete user */
//   .delete(userCtrl.remove);

/** Load user when API with userId route parameter is hit */
// router.param('userId', userCtrl.load);

export default router;
