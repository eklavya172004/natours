const AppError = require("../utils/appError")

const  handleCastErrorDB = err => {

}

const handleJWTError = () => new AppError('Inavlid token.Plaese try again!',401);

const handleJWTExpiredError = () => new AppError('Your token has expired',401);

const sendErrorDev = (err,res) => {

    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    })
}

const sendErrorProd = (err,res) => {
    //operational, trusted error: send message to client
    if(err.isOperational){
        res.status(err.statusCode).json({
        status: err.status,
        message: err.message
        })
    }else{
    // programming or other unknown error: don't leak error message details

    //1.log the error
    console.error('ERROR: ',err);

    //2.send the generic message to the console
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong, please try again later'
        })
    }
}

module.exports = (err,req,res,next) => {
    // if the errror is defined then err.statuscodde will run or else internal error is there
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error'

    if(process.env.NODE_ENV==='development'){

        sendErrorDev(err,res);

    }else if(process.env.NODE_ENV==='production'){
    
    let error = {...err};

    if(error.name === 'CastError'){
        error = handleCastErrorDB();
    }
    if(error.name === 'JsonWebTokenError'){
        error = handleJWTError();
    }
    if(error.name === 'TokenExpiredError'){
        error = handleJWTExpiredError();
    }

        sendErrorProd(error,res);
    }

// next();
};