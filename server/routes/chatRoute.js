const express=require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const chatController=require('../controllers');
const multerMiddleware=require('../config/cloudinaryConfig');

const router=express.Router();


router.post('/send-message',authMiddleware,multerMiddleware,chatController.sendMessage);
router.get('/conversations',authMiddleware,chatController.getConversations);
router.get('/conversation/:conversationId/messages',authMiddleware,chatController.getMessages);
router.post('/messages/read',authMiddleware,chatController.markAsRead);
router.delete('/messages/:messageId',authMiddleware,chatController.deleteMsg);

module.exports=router;