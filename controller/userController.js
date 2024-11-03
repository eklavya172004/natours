const AppError = require('../utils/appError');
const User = require('./../model/userModel');
// const APIfeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');

const filterObj = (obj , ...allowedfields) => {

    const newObj = {};

    Object.keys(obj).forEach(el => {
        if(allowedfields.includes(el)) newObj[el] = obj[el];
    })

    return newObj;
}

exports.getAllUsers = catchAsync(async (req,res) => {
    const users = await User.find(); 
        
        // Send
        res.status(200).json({
            status:'success',
            result: users.length,
            data:{
                users
            }
        });
})

exports.updateMe = catchAsync( async (req,res,next) => {
    // 1. Create error if user posts passowrd data
    if(req.body.password || req.body.passwordConfirmation) {
        return next(new AppError('This route is not for password updates. Please use /updateMyPassword instead!'));
    }

    // 3. Filtered out unwanted fields that are not allowed to be get updated
    const filteredBody = filterObj(req.body,'name','email');
    console.log('Filtered Body:', filteredBody); 

    //2.Update user document
    const UpdatedUser = await User.findByIdAndUpdate(req.user.id,filteredBody ,{
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status:'success',
        data:{
            user:UpdatedUser
        }
    })
})

exports.deleteMe = catchAsync(async (req,res,next) => {
    await User.findByIdAndUpdate(req.user.id , {active:false} )

    res.status(204).json({
        status:'success',
        data:null
    })
})

exports.createUser = (req,res) => {
    res.status(500).json({
        status:'success',
        message:'this route is not yet define'
    })
}

exports.getAllUsersId = (req,res) => {
    res.status(500).json({
        status:'error',
        message:'Something went wrong'
    })
}

exports.deleteUser = (req,res) => {
    res.status(500).json({
        status:'error',
        message:'Something went wrong'
    })
}

exports.patch1 = (req,res) => {
    res.status(500).json({
        status:'error',
        message:'Something went wrong'
    })
}