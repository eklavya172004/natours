const express= require('express');
const tourController = require('../controller/tourController');
const authController = require('./../controller/authController');

const router = express.Router();//mounting the routes

// router.param('id',tourController.checkID);
// router.param('id',tourController.checkBody);
// the val parameter stored the value of the id here 

//alias routes crating and routing for filtering and showing only needed routes
router.route('/top-5-routes').get(tourController.aliasTour,tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-stats/:year').get(tourController.getMonthlyplan);


router.route('/').get( authController.protect, tourController.getAllTours).post( tourController.createTour);

router.route('/:id')
.get(tourController.getAllToursId)
.patch(tourController.patch)
.delete(authController.protect,
    authController.restrictTo('admin','lead-guide'),
    tourController.deleteTour);

module.exports = router;