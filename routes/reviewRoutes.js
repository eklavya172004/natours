const express = require('express');
const reviewController = require('./../controller/reviewController');
const authcontroller = require('./../controller/authController');
const router = express.Router();

router.route('/').get(reviewController.getAllReviews).post( authcontroller.protect , authcontroller.restrictTo('user'),reviewController.setTourUserId,reviewController.createReviews);

router.route(':/id').patch(reviewController.updateReview).delete(reviewController.deleteReview);

module.exports = router;