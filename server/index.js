const express=require('express');
const cookieParser=require('cookie-parser');
const cors=require('cors');
const dotenv=require('dotenv');
const connectDB=require('./config/dbConnect')
const bodyParser=require('body-parser');
const authRoute=require('./routes/authRoute');
const chatRoute=require('./routes/chatRoute');
const http=require("http");
const {initializeSocket}=require("./services/socketService");

dotenv.config();

const PORT=process.env.PORT;

const app=express();


//Setting up Cross origin resource sharing
const corsOption={
    origin:process.env.FRONTEND_URL,
    credentials:true
}

app.use(cors(corsOption));

//Middlewares
app.use(express.json()); //Parse body data
app.use(cookieParser()); //Parse token on every request
app.use(bodyParse.urlencoded({extension:true}));


//Creating Server
const server=http.createServer(app);
const io=initializeSocket(server);

//Database Connection
connectDB();


//Routes
app.use('/api/auth',authRoute);
app.user('/api/chat',chatRoute);
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})