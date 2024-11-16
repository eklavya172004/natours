// const Review = require('./../model/reviewModel');
const Review = require('./../model/reviewModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerController');

exports.getAllReviews = catchAsync(async (req, res,next) => {
    const reviews = await Review.find();
    
    res.status(200).json({
        status:'success',
        result: reviews.length,
        data:{
            reviews
        }
    })
}
)

exports.setTourUserId = catchAsync( async(req,res,next) => {
    if(!req.body.tour) req.body.tour = req.params.tourId;
    if(!req.body.user) req.body.user = req.user.id;
    next();
})

exports.createReviews = factory.createOne(Review);

exports.updateReview = factory.updateOne(Review);

exports.deleteReview = factory.deleteOne(Review);