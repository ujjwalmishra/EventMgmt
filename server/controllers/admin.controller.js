import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import config from '../../config/config';
import Admin from '../models/admin.model';


function create(req, res, next) {
    console.log("creating admin");
    const admin = new Admin({
      username: req.body.username,
      password: req.body.password
    });

    admin.save()
      .then(admin => res.json(admin))
      .catch(e => next(e));
}

/**
 * Returns jwt token if valid username and password is provided
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function login(req, res, next) {

  Admin.findOne({ username: req.body.username })
    .exec()
    .then((admin) => {
      if(!admin) {
        let err = new APIError('No such user exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      }
      admin.comparePassword(req.body.password, (err, isMatch) => {
            if (err) { 
              let err = new APIError('No such password exists!', httpStatus.NOT_FOUND);
              return Promise.reject(err); 
            }
            if (isMatch) {
                  console.log("is a isMatch")
                  const token = jwt.sign(
                      {
                        username: admin.username
                      }, 
                      config.jwtSecret
                    );
                  return res.json({
                    token,
                    username: admin.username
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

function createMerchant(req, res, next) {
  const merchant = new Merchant({
    email: req.body.email,
    password: req.body.password,
    company: req.body.company,
    mobileNumber: req.body.mobileNumber,
    userCount: req.body.userCount,
    eventCount: req.body.eventCount
  });

  merchant.save()
    .then(savedMerchant => res.json(savedMerchant))
    .catch(e => next(e));
}

function updateMerchant(req, res, next) {
  Merchant.findByIdAndUpdate(req.body.id, { $set: { 
    email: req.body.email,
    password: req.body.password,
    company: req.body.company,
    mobileNumber: req.body.mobileNumber,
    userCount: req.body.userCount,
    eventCount: req.body.eventCount
  }}, { new: true }, function (err, merchant) {
    if (err) return next(err);
    res.send(merchant);
  });
}

function deleteMerchant() {

}

function getMerchants() {

}


export default { create, login, createMerchant, updateMerchant, deleteMerchant, getMerchants };
