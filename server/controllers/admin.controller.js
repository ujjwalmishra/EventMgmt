import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import config from '../../config/config';
import Admin from '../models/admin.model';
import Merchant from '../models/merchant.model';


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
        let err = new APIError('No such user exists!',  httpStatus.UNAUTHORIZED, true);
        return next(err);
      }
      admin.comparePassword(req.body.password, (err, isMatch) => {
            if (err) {
              let err = new APIError('No such password exists!',  httpStatus.UNAUTHORIZED, true);
              return next(err); 
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
              err = new APIError('No such password exists!',  httpStatus.UNAUTHORIZED, true);
              return next(err);              
            }
 
      });      
    })
    .catch(e => next(e));    
}


function createMerchant(req, res, next) {

  Admin.findOne({username: req.user.username})
  .exec()
  .then((admin) => {
      console.log("got admin");
        Merchant.findOne({ email: req.body.email })
        .exec()
        .then((merchant) => {
          if(!merchant) {
           const merchant = new Merchant({
            email: req.body.email,
            password: req.body.password,
            company: req.body.company,
            mobileNumber: req.body.mobileNumber,
            userCount: req.body.userCount,
            eventCount: req.body.eventCount
          })


          merchant.save()
            .then(savedMerchant => {
              admin.merchants.push(savedMerchant._id);
              admin.save()
              .then(admin => res.json(savedMerchant))
              .catch(e => next(e));
              
            }
            )
            .catch(e => {
                const err = new APIError('Merchant Save Failed 1!', httpStatus.OK, true);
              next(err)}); 
          }
          else {
            const err = new APIError('Email id exists already!', httpStatus.OK, true);
            return next(err); 
          }
        } )
        .catch(e => {
                const err = new APIError('Merchant Save Failed 2!', httpStatus.OK, true);
              next(err)}); 

  })
    .catch(e => {
      const err = new APIError('Merchant Save Failed 3!', httpStatus.OK, true);
    next(err)}); 


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
    if (err) return next(new APIError('Merchant Update Failed!', httpStatus.OK, true));
    res.json(merchant);
  });
}

function deleteMerchant(req, res, next) {
  const merchantId = req.body.merchantId;
  if(merchantId == null) {
    const err = new APIError('Provide a id!', httpStatus.OK, true);
    return next(err); 
  }
  Merchant.find({ _id: merchantId })
  .remove()
  .exec()
  .then(deletedMerchant => {
    Admin.findOne({username: req.user.username})
    .exec()
    .then((admin) => {
      admin.merchants.pull(merchantId);
      admin.save()
      .then(admin => res.json(deletedMerchant))
      .catch(e => next(e));
    })
  })
  .catch(e => next(new APIError('Merchant Delete Failed!', httpStatus.OK, true)))
}

function getMerchants(req, res, next) {
  const { limit = 50, skip = 0 } = req.query;
  Merchant.list({ limit, skip })
    .then(merchants => res.json(merchants))
    .catch(e => next(new APIError('Merchant List Failed!', httpStatus.OK, true)));
}


export default { create, login, createMerchant, updateMerchant, deleteMerchant, getMerchants };
