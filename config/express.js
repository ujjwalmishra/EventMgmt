import express from 'express';
import logger from 'morgan';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compress from 'compression';
import methodOverride from 'method-override';
import cors from 'cors';
import httpStatus from 'http-status';
import expressWinston from 'express-winston';
import expressValidation from 'express-validation';
import helmet from 'helmet';
import winstonInstance from './winston';
import db from './db';
import routes from '../server/routes/index.route';
import config from './config';
import APIError from '../server/helpers/APIError';
import session from 'express-session';
import hbs from 'express-hbs';
import path from 'path';

const MongoStore = require('connect-mongo')(session);

const app = express();

if (config.env === 'development' || config.env === 'production') {
  app.use(logger('dev'));
}

// parse body params and attache them to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(compress());
app.use(methodOverride());

// secure apps by setting various HTTP headers
app.use(helmet());

// enable CORS - Cross Origin Resource Sharing
app.use(cors());

app.use(cookieParser());

//session init
app.use(session({
  secret: config.SECRET,
    store: new MongoStore({ mongooseConnection: db.connection }),
    resave: false,
    saveUninitialized: true,
    cookie: { secure: !true }
}));


// enable detailed API logging in dev env
if (config.env === 'development' || config.env === 'production') {
  expressWinston.requestWhitelist.push('body');
  expressWinston.responseWhitelist.push('body');
  app.use(expressWinston.logger({
    winstonInstance,
    meta: true, // optional: log meta data about request (defaults to true)
    msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
    colorStatus: true // Color the status code (default green, 3XX cyan, 4XX yellow, 5XX red).
  }));
}

//prevent un auth access to qr codes
app.use(function(req, res, next) {
  
    if (req.session.merchant == null && req.path.indexOf('/codes') === 0)
    {
        res.json({"msg": "UnAuth"});
    }
    else{
      next();   
    }
    
});

app.use(express.static('public'));


app.engine('server.html', hbs.express4({
  extname: '.server.html'
}));
app.set('view engine', 'server.html');
app.set('views', path.resolve('./'));

// mount all routes on /api path
app.use('/api', routes);

// if error is not an instanceOf APIError, convert it.
app.use((err, req, res, next) => {
  if (err instanceof expressValidation.ValidationError) {
    // validation error contains errors which is an array of error each containing message[]
    //const unifiedErrorMessage = err.errors.map(error => error.messages.join('. ')).join(' and ');
    //const error = new APIError(unifiedErrorMessage, err.status, true);
    return next(error);
  } else if (!(err instanceof APIError)) {
    const apiError = new APIError(err.message, err.status, err.isPublic);
    return next(apiError);
  }
  return next(err);
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new APIError('API not found', httpStatus.OK, true);
  return next(err);
});


// log error in winston transports except when executing test suite
// if (config.env !== 'test') {
//   app.use(expressWinston.errorLogger({
//     winstonInstance
//   }));
// }

// error handler, send stacktrace only during development
app.use((err, req, res, next) => // eslint-disable-line no-unused-vars

{ 
  //app beta stage send all errors
  res.status(err.status).json({
    message: err.message ,
    stack: config.env === 'development' ? err.stack : {}
  })
}
 
);

export default app;
