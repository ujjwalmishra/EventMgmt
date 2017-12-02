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
              return Promise.reject(err);
          }
          merchant.comparePassword(req.body.password, (err, isMatch) => {
            if (err) { 
                let err = new APIError('No such password exists!', httpStatus.NOT_FOUND);
                return Promise.reject(err); 
            }
            if (isMatch) {
                const token = jwt.sign(
                    {
                        email: merchant.email
                    },
                    config.jwtSecret
                );
                return res.json({
                    token,
                    email: merchant.email
                });
            }
            else {
                err = new APIError('No such password exists!', httpStatus.NOT_FOUND);
                return Promise.reject(err); 
            }
          });
      })
      .catch(e => next(e));
 }

function profile(req, res, next) {

    Merchant.findOne({email : req.params.merchantEmail})
      .exec()
      .then((merchant) => {
          if(!merchant) {
            let err = new APIError('No such user exists!', httpStatus.NOT_FOUND);
            return Promise.reject(err);
          }
          const profile = merchant.profile;
          //if(null == profile)
          //TODO profile implementation
      })

}

function updateProfile(req, res, next) {

}

function resetPasswrd(req, res, next) {
    
}

function updatePasswrd(req, res, next) {
    
}


 export default { login, profile, updateProfile, resetPasswrd, updatePasswrd };