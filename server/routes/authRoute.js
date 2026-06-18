const express=require('express');

const authController=require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const { multerMiddleware } = require('../config/cloudinaryConfig');
const router=express.Router();

router.post('/send-otp',authController.sendOTP);
router.post('/verify-otp',authController.verifyOTP);
router.post('/logout',authController.logout);

//Protected Route
router.put('/update-profile',authMiddleware,multerMiddleware,authController.updateProfile)
router.get('/check-auth',authMiddleware,authController.checkAuthenticated);
router.get('/users',authMiddleware,authController.getAllUsers);

module.exports=router;