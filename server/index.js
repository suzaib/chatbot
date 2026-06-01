const express=require('express');
const cookieParser=require('cookie-parser');
const cors=require('cors');
const dotenv=require('dotenv');
const connectDB=require('./config/dbConnect')

dotenv.config();

const PORT=process.env.PORT;

const app=express();

//Database Connection
connectDB();

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})