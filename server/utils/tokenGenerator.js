const jwt=require('jsonwebtoken');

const generateToken=(userId)=>{
    return jwt.sign({userId},process.JWT.SECRET,{
        expiresIn:'1y'
    });
}

module.exports=generateToken;