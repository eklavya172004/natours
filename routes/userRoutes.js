const express = require('express');
const router = express.Router();
const userController = require('./../controller/userController');
const authController = require('./../controller/authController');

// Authentication routes
router.post('/signup',authController.signup);
router.post('/login',authController.login);



router.post('/forgotPassword',authController.forgotPassword);
router.patch('/resetPassword/:token',authController.resetPassword);

router.patch('/updateMe',authController.protect,userController.updateMe);

router.delete('/deleteMe',authController.protect,userController.deleteMe);

router.patch('/updatePassword', authController.protect,authController.updatePassword);

router.route('/').get(userController.getAllUsers).post(userController.createUser);

router.route('/:id').get(userController.getAllUsersId).patch(userController.patch1).delete(userController.deleteUser);

module.exports = router;