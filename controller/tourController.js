// const fs = require('fs');
const Tour = require('./../model/tourModel');
const APIfeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');
// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

// exports.checkID = (req,res,next,val) => {
//   // console.log(`tour id is ${val}`);
//     const id = req.params.id * 1;
//     const tour = tours.find(el => el.id === id );
//     if(!tour){
//         return res.status(404).json({
//             status:'fail',
//             message:'Invalid ID'
//         })
//     }
//     next();
// }

// exports.checkBody = (req,res,next) => {
//     if(!req.body.name || !req.body.price) {
//         return res.status(400).json({
//             status:'fail',
//             message:'Invalid name and price'
//         })
//     }
//     next();
// }

//alias routes
exports.aliasTour = (req,res,next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingAverage,price';
    req.query.fields = 'name,price,ratingAverage,duration,difficulty';
    next();
}
 
exports.getAllTours = catchAsync(async (req,res,next) => {

    // try {

        // console.log(req.query);

        //filter methods 

        // Normal way - 1
        // const tours = await Tour.find({
        //     duration:5,
        //     difficulty: 'easy'
        // });

        // 2nd way
        // const tours = await Tour.find()
        // .where('duration')
        // .equals(5)
        // .where('difficulty')
        // .equals('easy');


        // Build a query
        // 1)Filtering-----------------------------------------------
        // const queryObj = {...req.query};
        // const excludedFields = ['page','sort','limit','fields'];
        // excludedFields.forEach(el => delete queryObj[el]);  

        // console.log(req.query,queryObj);
        // console.log(req.query);
    //    { difficulty: { $gte: 'easy' }, duration: '5' } mongodb string 
    //     { difficulty: { gte: 'easy' }, duration: '5' } we got this field

    //  2)Advanced filtering---------------------------------------------

        // let queryStr = JSON.stringify(queryObj);
        // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g,match => `$${match}`);
        // console.log(JSON.parse(queryStr));

        // let query = Tour.find(JSON.parse(queryStr));

//      3)Sorting----------------------------------------------------------
        // if(req.query.sort){
        //     const sortby = req.query.sort.split(',').join(' ');
        //     console.log(sortby);

        //     query = query.sort(sortby);
        // }else{
        //     query = query.sort('createAt');
        // }

    //4) Fields--------------------------------------------------------
    // if(req.query.fields){
    //     const fields = req.query.fields.split(',').join(' ');
    //     query = query.select(fields);
    // }else{
    //     query = query.select('-__v');
    // }

// 5) Pagination--------------------------------------------------------    
    // const page = Number(req.query.page) * 1 || 1;
    // const limit = Number(req.query.limit) * 1 || 100;
    // const skip = (page - 1) * limit;

    // // console.log(`Page: ${page}, Limit: ${limit}, Skip: ${skip}`);
    // query = query.skip(skip).limit(limit);

    // if(req.query.page){
    //     const numTours = await Tour.countDocuments();

    //     if(skip >= numTours){
    //         throw new Error('This page doesn\'t exist')
    //     }
    // }
            // tour  
//      Why Not await Here: At this point, you might want to modify the query further (e.g., add sorting or pagination). Using await here would execute the query immediately, preventing any additional modifications.


        //Execute an Query
        const features = new APIfeatures(Tour.find(),req.query)
                                                .filter()
                                                .sort()
                                                .Limitfields()
                                                .Pagination();

        const tours = await features.query; 
        
        // Send
        res.status(200).json({
            status:'success',
            result: tours.length,
            data:{
                tours:tours
            }
        });

});

exports.getAllToursId = catchAsync(async (req,res,next) => {

    // try {

       const tour = await Tour.findById(req.params.id).populate('reviews');
    //    .populate({
    //     path:'guides',
    //     select:'-__v'
    //    });

       // Tour.findOne({_id: req.params.id}) this works the same way as above

        if(!tour){
            return next(new AppError('No tour found with that id',404));
        }

       res.status(200).json({
            status:'success',
            data:{
                tour
            }
        })
    
    // const tour = tours.find(el => el.id === id );
    // // all the variables , parameters are stored 
    // // automatically assigns the value to the parameter

    // res.status(200).json({
    //     status:'success',
    //     // results:tours.length,
    //     data:{
    //         tour
    //     }
    // })
});

exports.createTour = catchAsync(async (req,res,next) => {
    // console.log(req.body);
    const newTour = await Tour.create(req.body);


    res.status(201).json({
        status:'success',
        data:{
              tour:newTour
        }
    });

    // try {
    
    //     // res.status(201).json({
    //     //     status:'success',
    //     //     data:{
    //     //           tour:newTour
    //     //     }
    //     // });
    // } catch (error) {
    //     res.status(400).json({
    //         status:'fail',
    //         message:error
    //     })
    // }
    // res.send('Done');
});

exports.patch = catchAsync(async (req,res,next) =>{

    // try {
       const tour = await Tour.findByIdAndUpdate(req.params.id, req.body ,{
            new: true,
            runValidators: true
        });

        if(!tour){
            return next(new AppError('No tour found with that id',404));
        }

        res.status(200).json({
            status:'success',
            data:{
                tour
            }
        });
    
});

exports.deleteTour = catchAsync(async (req,res,next) =>{

    // const tour = tours.find(el => el.id === id );

    // try {
        
        const tour = await Tour.findByIdAndDelete(req.params.id);

         if(!tour){
            return next(new AppError('No tour found with that id',404));
        }

            res.status(204).json({
                status:'success',
                data:null
            })
        
})

exports.getTourStats = catchAsync(async (req, res,next) => {
    // try {
        const stats = await Tour.aggregate([
           { 
            $match: {
             ratingAverage:{$lte:4.5},
            },
        },
        {
            $group:{
                    _id:{$toUpper: '$difficulty' },
                    numTours:{$sum: 1},
                    numRating:{$sum: '$ratingQuantity'},
                    avgRating:{$avg:'$ratingAverage'},
                    avgPrice:{$avg: '$price'},
                    minPrice:{$min: '$price'},
                    maxPrice:{$max: '$price'},
                },
            },
            {
                $sort: {avgPrice: 1}
            }
        ]);

        res.status(200).json({
            status:'success',
            data:{
                stats
            }
        });
});

exports.getMonthlyplan = catchAsync(async (req, res,next) => {
    // try{
        const year = req.params.year * 1;

         const plan = await Tour.aggregate([
            {
                $unwind: '$startDates'
            },
            {
                $match: {
                    startDates:{
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $group:{
                    _id: {$month: '$startDates'},
                    numTourStarts: {$sum: 1},
                    tours: {$push: '$name'}
                }
            },
            {
                $addFields:{month: '$_id'}
            },
            {
                // it removes the id field
                $project:{
                    _id: 0
                }
            },
            {
                $sort:{ numTourStarts: -1 }
            }
         ]);

         res.status(200).json({
            status:'success',
            data:{
                plan
            }
        });

});