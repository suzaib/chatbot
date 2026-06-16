const jwt=require('jsonwebtoken');

const authMiddleware=(req,res,next)=>{
    const authToken=req.cookies.auth_token;
}