const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    review:{
        type: String,
        required:[true,'Review must have a content']
    },
    rating:{
        type:Number,
        required:[true,'Review must have a rating'],
        min: [0,'Rating must be above 0'],
        max:[5,'Rating must be below/upto 5.0']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },    
    user:{
        type: mongoose.Schema.ObjectId,
        ref: 'User',  // User is the name of the model
        required: [true,'Review must belong to a user'],
    },
    tour:{
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',  // Tour is the name of the model
        required: [true,'Review must belong to a tour']
    },
},
{
        toJSON:{virtuals:true},
        toObject:{virtuals:true}
}
)

ReviewSchema.pre(/^find/,function(next){
        // this.populate({
        //     path:'user',
        //     select:'name'
        // }).populate({
        //     path:'tour',
        //     select:'name'
        // })
        this.populate({
            path:'user',
            select:'name'
        })

        next();
    })

module.exports = mongoose.model('Review', ReviewSchema);

//POST /tour/4g423f4/reviews
//GET /tour/4g423f4/reviews
// ths will get all the reviews for the tour with id 4g423f4

//GET /tour/4g423f4/reviews/4234g2
//we can see the particular review 