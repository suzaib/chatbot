const express=require('express');

const authController=require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const { multerMiddleware } = require('../config/cloudinaryConfig');
const router=express.Router();

router.post('/send-otp',authController.sendOTP);
router.pose('/verify-otp',authController.verifyOTP);

//Protected Route
router.put('/update-profile',authMiddleware,multerMiddleware,authController.updateProfile)

module.exports=router;