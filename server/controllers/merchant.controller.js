import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import config from '../../config/config';
import Merchant from '../models/merchant.model';
import nodemailer from 'nodemailer';
import async from 'async';
import crypto from 'crypto';
import path from 'path';

const smtpTransport = nodemailer.createTransport(config.mailer.options);

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
              let err = new APIError('No such user exists!',  httpStatus.UNAUTHORIZED, true);
              return next(err);
          }
          merchant.comparePassword(req.body.password, (err, isMatch) => {
            if (err) { 
                let err = new APIError('No such password exists!',  httpStatus.UNAUTHORIZED, true);
                return next(err); 
            }
            if (isMatch) {
                const token = jwt.sign(
                    {
                        email: merchant.email
                    },
                    config.jwtSecret
                );
                console.log(req.session);
                let session = req.session;
                session.merchant = merchant;
                return res.json({
                    token,
                    email: merchant.email
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

function logout(req, res, next) {

    req.session.merchant = null;

}


function profile(req, res, next) {

    if(!req.session.merchant) {
      res.redirect('/login');
    }

    console.log("logged merchant");
    console.log(req.session.merchant);

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
          console.log("came eher");

      })
      .catch(e => next(e));

}

function updateProfile(req, res, next) {

  if(!req.session.merchant) {
    res.redirect('/login');
  }

  Merchant.findByIdAndUpdate(req.session.merchant._id, { $set: { 
    'profile.name': req.body.name,
    'profile.contact': req.body.contact
  }}, { new: true }, function (err, merchant) {
    if (err) return next(err);
    res.send(merchant);
  });
}

function resetPasswrdToken(req, res, next) {

    async.waterfall([
    // Generate random token
    function (done) {
      crypto.randomBytes(20, function (err, buffer) {
        var token = buffer.toString('hex');
        done(err, token);
      });
    },
    // Lookup merchant by email
    function (token, done) {
      if (req.body.usernameOrEmail) {

        const usernameOrEmail = String(req.body.usernameOrEmail).toLowerCase();

        Merchant.findOne(
            { email: usernameOrEmail }        
        , '-salt -password', function (err, merchant) {
          if (err || !merchant) {
            return res.status(400).send({
              message: 'No account with that username or email has been found'
            });
          } else {
            merchant.passwordResetToken = token;
            merchant.passwordResetExpires = Date.now() + 3600000; // 1 hour

            merchant.save(function (err) {
              done(err, token, merchant);
            });
          }
        });
      } else {
        return res.status(422).send({
          message: 'Username/email field must not be blank'
        });
      }
    },
    function (token, merchant, done) {

      let httpTransport = 'http://';
      if (config.secure && config.secure.ssl === true) {
        httpTransport = 'https://';
      }
      const baseUrl = config.domain || httpTransport + req.headers.host;
      res.render(path.resolve('templates/reset-password-email'), {
        name: merchant.profile.name,
        appName: "Main",
        url: baseUrl + '/api/merchant/reset/' + token
      }, function (err, emailHTML) {
        done(err, emailHTML, merchant);
      });
    },
    // If valid email, send reset email using service
    function (emailHTML, merchant, done) {
      const mailOptions = { 
            from: 'no-reply@infinity.io', 
            to: merchant.email, 
            subject: 'Password Reset', 
            html: emailHTML
      };
      smtpTransport.sendMail(mailOptions, function (err) {
        if (!err) {
          res.send({
            message: 'An email has been sent to the provided email with further instructions.'
          });
        } else {
          console.log(err);
          return res.status(400).send({
            message: 'Failure sending email'
          });
        }

        done(err);
      });
    }
  ], function (err) {
    if (err) {
      return next(err);
    }
  });
    
}

function verifyResetToken(req, res, next) {

  Merchant.findOne({
    passwordResetToken: req.params.token,
    passwordResetExpires: {
      $gt: Date.now()
    }
  }, function (err, merchant) {
    if (err || !merchant) {
      const err = new APIError('No such user exists!',  httpStatus.UNAUTHORIZED, true);
      return next(err);
    }

    res.json({"status": "0", "token": req.params.token});
  });

}

function resetPassword (req, res, next) {
  // Init Variables
  const passwordDetails = req.body;

  async.waterfall([

    function (done) {
      Merchant.findOne({
        passwordResetToken: req.params.token,
        passwordResetExpires: {
          $gt: Date.now()
        }
      }, function (err, merchant) {
        if (!err && merchant) {
          if (passwordDetails.newPassword === passwordDetails.verifyPassword) {
            merchant.password = passwordDetails.newPassword;
            merchant.passwordResetToken = undefined;
            merchant.passwordResetExpires = undefined;

            merchant.save(function (err) {
              if (err) {
                return res.status(422).send({
                  message: err
                });
              } else {
                  // Remove sensitive data before return authenticated user
                  merchant.password = undefined;
                  merchant.salt = undefined;

                  res.json(merchant);

                  done(err, merchant);
                
                  }
            });
          } else {
            return res.status(422).send({
              message: 'Passwords do not match'
            });
          }
        } else {
          return res.status(400).send({
            message: 'Password reset token is invalid or has expired.'
          });
        }
      });
    },
    function (merchant, done) {
      res.render('templates/reset-password-confirm-email', {
        name: merchant.profile.name,
        appName: "Main"
      }, function (err, emailHTML) {
        done(err, emailHTML, merchant);
      });
    },
    // If valid email, send reset email using service
    function (emailHTML, merchant, done) {
      const mailOptions = {
          from: 'no-reply@infinity.io', 
          to: merchant.email, 
          subject: 'Password Reset', 
          html: emailHTML
      };

      smtpTransport.sendMail(mailOptions, function (err) {
        done(err, 'done');
      });
    }
  ], function (err) {
    if (err) {
      return next(err);
    }
  });
};

function updatePasswrd(req, res, next) {
    
}


 export default { login, profile, updateProfile, resetPasswrdToken, verifyResetToken, resetPassword, updatePasswrd };