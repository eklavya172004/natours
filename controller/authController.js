const crypto = require('crypto');  
const {promisify} = require('util');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const User = require('./../model/userModel');
const AppError = require('../utils/appError');
const sendEmail = require('./../utils/email');

const signToken = id => {
     return jwt.sign({ id },process.env.JWT_SECRET,{ expiresIn: process.env.JWT_EXPIRES_IN })
} 

const createSendToken = (user,statusCode,res) => {

    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly:true
    }
    if(process.env.NODE_ENV === 'production') {
        cookieOptions.secure = true;
    }


    res.cookie('jwt',token,cookieOptions);

    //removw the passsword from output
    user.password =  undefined;

    res.status(statusCode).json({
        status:'success',
        token:token,
        data:{
            user
        }
    })
}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirmation: req.body.passwordConfirmation,
        passwordChangedAt: req.body.passwordChangedAt,
        role:req.body.role
    });

   // SO HERE WE JUST CREATED THE USER AND CREATED THE TOKEN FOR IT WITH HEADER+PAYLOAD AND SECRETE KEY AND SEND IT TO THE CLIENT
   createSendToken(newUser,201,res)

    // const token = signToken(newUser._id);

    // res.status(201).json({
    //     status:'success',
    //     token,
    //     data:{
    //         user:newUser
    //       }
    // })
})

exports.login = catchAsync(async (req,res,next) => {

    const {email,password} = req.body;
    //1. check if email and password exist
    if(!email || !password){
        return next(new AppError('Please provide a valid email and password!',400));
    }
    
    //2.check if user and password is correct
    const user = await User.findOne({email:email}).select('+password');

    //3. if there is no user with that email or no password then log that error
    if(!user || !(await user.correctPassword(password,user.password))) {
        return next(new AppError('Incorrect email or password',401));
    }

    // console.log(user);

    //4.if everything is ok then send token to the client
    createSendToken(user,200,res);
}
)

exports.protect = catchAsync(async (req, res, next) => {
    //1.getting the token and check if its still exist
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
         token = req.headers.authorization.split(' ')[1];
    };

    // console.log(token);

    if(!token){
        return next(new AppError('You are not logged in to get the access.',401));
    }

    //2.verify that token
    const decoded = await promisify(jwt.verify)(token,process.env.JWT_SECRET);

    console.log(decoded);

    //3.check if user still exists
    //or the user is deleted 

    const freshUser = await User.findById(decoded.id);
    if(!freshUser){
        return next(new AppError('The user doesn\'t exist any longer',401));
    }

    //4.check if user changed password after that token

    if(freshUser.changedPassword(decoded.iat)){
        return next(new AppError('The user changed password! Please login again',401));
    };
    
    // Grant access to protected route
    req.user = freshUser;

    next();
});

exports.restrictTo = (...roles) => {
    return (req,res,next) => {
        
        // roles = ['user','guide'] , ['lead-guide','admin']

        if(!roles.includes(req.user.role)){
            return next(new AppError('You do not have permission to access this',403));
        }
        next();
    }
}
exports.forgotPassword = catchAsync(async (req,res,next) => {
    //1. Get user based on POSTED email
        const user = await User.findOne({ email: req.body.email});

        if(!user){
            return next(new AppError('There is no user exist with this email',403));
        }
    //2. Generate random reset token
            const resetToken = user.createPasswordResetToken();

            await user.save({validateBeforeSave:false});

    //3. Send it to user's email address

    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`
    
    const message = `You are receiving this email because you (or someone else) has requested to reset your password. Please click on the following link to complete the process: \n\n${resetURL}\n\nIf you did not request this, please ignore this email and no changes will be made.`;
    
    try {
        await sendEmail({
            email: user.email,
            subject: 'Password reset token valid only for 10 mins',
            message 
        });
    
        res.status(200).json({
            status:'success',
            message:'Token sent to email'
        })
    } catch (error) {
        user.passwordResetToken = undefined,
        user.passwordResetExpiresAt = undefined;

        await user.save({validateBeforeSave:false});

        return next(new AppError('There was an error sending email. Try again later',500));
    }
    
})

exports.resetPassword = catchAsync(async (req,res,next) => {
// 1. Get user based on token 
    const hasToken = crypto
                    .createHash('sha256')
                    .update(req.params.token)
                    .digest('hex');

    const user = await User.findOne({
        passwordResetToken:hasToken,
        passwordResetExpiresAt: {$gt: Date.now()}
    })

// 2. If token has not expired, and there is user, set the new  password
    if(!user){
        return next(new AppError('Token expired or invalid',400));
    }

    user.password = req.body.password;
    user.passwordConfirmation = req.body.passwordConfirmation;
    user.passwordResetToken = undefined;
    user.passwordResetExpiresAt = undefined;
    await user.save();

// 3. Update changedPassword property for the user

// 4.Log the user in, send JWT 
createSendToken(user,200,res);

})

exports.updatePassword = catchAsync(async (req,res,next) => {
    //1.Get the user from thse collection
    console.log(req.body);
   const user = await User.findById( req.user.id ).select('+password');

   console.log(user);
   //2.Check if posted current password is current
    if(!user || !(await user.correctPassword(req.body.CurrentPassword,user.password)) ){
        return next(new AppError('Current password is incorrect',401));
    }
    
    //3. if so then update the password 
    user.password = req.body.password;
    user.passwordConfirmation = req.body.passwordConfirmation;
    await user.save();

    // we can't use findByIdAndUpdate 

    //4. login user and send the jwt token 
    createSendToken(user,200,res);
}
)