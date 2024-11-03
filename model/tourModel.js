const mongoose = require('mongoose');
const slugify = require('slugify'); 
// const User = require('./userModel');

const Tourschema = new mongoose.Schema({
    name:{
        type: String,
        required:[true,'tour must have a name'],
        unique: true,
        trim: true,
        maxlength: [40,'A tour must have less or equal than 40 characters'],
        minlength:[10,'A tour must have more or equal than 10 characters'],
        //external lib
        // validate: validator.isAlpha
    },
    slug:String,
    duration:{
        type:Number,
        required:[true,'tour must have a duration']
    },
    difficulty:{
        type:String,
        required:[true,'tour must have a difficulty'],
        enum: { values: ['easy','medium','difficult'],
                message:'Difficulty must have difficult,easy,medium'
        }
        },
    maxGroupSize:{
        type:Number,
        required:[true,'tour must have a group size']
    },
    ratingAverage:{
        type: Number,
        default:3.5,
        min: [1,'Rating must be above 1.0'],
        max:[5,'Rating must be below 5.0']
    },
    ratingQuantity:{
        type:Number,
        default:0
    },
    price:{
        type: Number,
        required:[true,'tour must have a price']
    },
    priceDiscount:{
        type: Number,
        validate:{
        validator:function(val){
    //  this only points to current doc on new document creation
            return val < this.price; 
        },
        message:'Discount price ({VALUE}) must be below regular price'
    }
    },
    summary:{
        type:String,
        trim:true
        // required:[true,'tour must have a description']
    },
    description:{
        type:String,
        trim:true
    },
    imageCover:{
        type:String,
        required:[true,'tour must have  one cover image']
    },
    images:[String],createAt: {
        type: Date,
        default: Date.now()
    },
    startDates:[Date],
    SecreateTour:{
    type: Boolean,
    default: false
},
startLocation: {
    //geoJSON
    type:{
        type:String,
        default:'Point',
        enum: ['Point']
    },
    coordinates:[Number],
    address:String,
    description:String
},
locations: [
    //geoJSON
  { 
     type:{
        type:String,
        default:'Point',
        enum: ['Point']
    },
    coordinates:[Number],
    address:String,
    description:String,
    day:Number
}
],
guides:[
    {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }
]
},
{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
});

// this property is not the part of the database
Tourschema.virtual('durationWeeks').get(function(){
    return this.duration / 7;
})

//virtual populate: populates the virtual fields. It's used when we want to fetch related documents from other collections.
Tourschema.virtual('reviews',{
    ref:'Review',
    foreignField:'tour',
    localField:'_id'
})

//DOCUMENT MiddleWare: runs before .save() and .create() methods
Tourschema.pre('save', function(next){
    this.slug = slugify(this.name,{lower:true});
    next();
})

Tourschema.pre(/^find/, function(next){
    this.populate({
        path:'guides',
        select:'-__v'
       });

    next();
})
//embedding
// Tourschema.pre('save', async function(next){
//     const guidePromises = this.guides.map( async id => await User.findById(id));

//     this.guides = await Promise.all(guidePromises);
// })

// Query Middleware 
Tourschema.pre(/^find/, function(next){
    // this.slug = slugify(this.name,{lower:true});
    this.find({SecreateTour:{$ne:true}});

    this.start = Date.now();
    next();
})

Tourschema.post(/^find/, function(docs,next){
    // this.slug = slugify(this.name,{lower:true});
    console.log(`Query took ${Date.now() - this.start} milliseconds`);
    // console.log(docs);
    // this.find({SecreateTour:{$ne:true}});
    next();
})

Tourschema.pre('aggregate',function(next){
    this.pipeline().unshift({$match: {SecreateTour:{$ne:true}}});

    console.log(this.pipeline());
    next();
})

// Tourschema.pre('find', function(next){
//     // this.slug = slugify(this.name,{lower:true});
//     // this.find({SecreateTour:{$ne:true}});
//     next();
// })

// Tourschema.pre('findOne', function(next){
//     // this.slug = slugify(this.name,{lower:true});
//     this.find({SecreateTour:{$ne:true}});
//     next();
// })

// Tourschema.pre('save', function(){
//     console.log('Will save the next document');
//     next();
// })

// Tourschema.post('save',function(doc,next){
//     console.log(doc);
//     next();
// })

const Tour = mongoose.model('Tour',Tourschema);


module.exports = Tour;