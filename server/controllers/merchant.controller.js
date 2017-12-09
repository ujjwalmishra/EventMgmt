import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import config from '../../config/config';
import Merchant from '../models/merchant.model';

/**
 * Returns jwt token if valid username and password is provided
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */

 function login(req, res, next) {

    Merchant.findOne({email : req.body.email})
      .exec()
      .then((merchant) => {
          if(!merchant) {
              let err = new APIError('No such user exists!', httpStatus.NOT_FOUND);
              return next(err);
          }
          merchant.comparePassword(req.body.password, (err, isMatch) => {
            if (err) { 
                let err = new APIError('No such password exists!', httpStatus.NOT_FOUND);
                return next(err); 
            }
            if (isMatch) {
                const token = jwt.sign(
                    {
                        email: merchant.email
                    },
                    config.jwtSecret
                );
                let session = req.session;
                session.merchant = merchant;
                return res.json({
                    token,
                    email: merchant.email
                });
            }
            else {
                err = new APIError('No such password exists!', httpStatus.NOT_FOUND);
                return next(err); 
            }
          });
      })
      .catch(e => next(e));
 }

function logout(req, res, next) {

    req.session.merchant = null;

}


function profile(req, res, next) {

    if(!req.session.merchant) {
      res.redirect('/login');
    }

    Merchant.findOne({email : req.session.merchant.email})
      .exec()
      .then((merchant) => {
          if(!merchant) {
            let err = new APIError('No such user exists!',  httpStatus.UNAUTHORIZED, true);
            return Promise.reject(err);
          }
          const profile = merchant.profile;
          res.json({
            profile: profile
          });

      })
      .catch(e => next(e));

}

function updateProfile(req, res, next) {

}

function resetPasswrd(req, res, next) {
    
}

function updatePasswrd(req, res, next) {
    
}


 export default { login, profile, updateProfile, resetPasswrd, updatePasswrd };