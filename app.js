// Importing required modules
const express = require('express');
const morgan = require('morgan');
const tourRoutes = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const AppError = require('./utils/appError');
const globalError = require('./controller/errorController');
const rateLimit = require('express-rate-limit')
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const app = express();

// 1.GLOBAL MIDDLE WARES

//Set Securtiy http headers
app.use(helmet());
// console.log(process.env.NODE_ENV);

// development logging
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}
// console.log(process.env.NODE_ENV);
// we are using middleware here to modify the incomming req data


//limit req from same api
const limiter = rateLimit({
    max:100,
    windowMs: 60 * 60 * 1000, //  per hour
    message:'Too many request from this IP, please try again in an hour!'
})

app.use('/api',limiter);

//body parser, reading data from the body into req.body
app.use(express.json({limit: '10kb'}));

//Data sanitization against NoSQL query injection
app.use(mongoSanitize());

//Data sanitization against xss
app.use(xss());

//prevent parameter pollution
app.use(hpp({
    whitelist:[
        'duration','ratingAverage','maxGroupSize','ratingQuantity','difficulty','price'
    ]
}));

//serving static files
app.use(express.static(`${__dirname}/public`))

//test middleware
app.use((req,res,next) => {
    req.requestTime = new Date().toISOString();
    // console.log(req.headers);
    next();
});


// 2. ROUTES


// app.get('/api/v1/tours',getAllTours);

// app.post('/api/v1/tours',createTour);

// app.get('/api/v1/tours/:id',getAllToursId);

// app.patch('/api/v1/tours/:id',patch);

// app.delete('/api/v1/tours/:id',deleteTour);

// 3. Routes

app.use('/api/v1/tours',tourRoutes);
app.use('/api/v1/user',userRouter);
app.use('/api/v1/review',reviewRouter);

//handling unhandled routes
app.all('*', (req, res,next) => {
    // res.status(404).json({
    //     status: 'fail',
    //     message: `Can't find ${req.originalUrl} on this server`
    // });
    // const err = new Error(`Can't find ${req.originalUrl} on this server`);
    // err.status = 'fail';
    // err.statusCode  = 404;

    next(new AppError(`Can't find ${req.originalUrl} on this server`,404));
});

//error handling middleware
app.use(globalError);

// START SERVER
module.exports = app;

