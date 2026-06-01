const mongoose=require("mongoose");

const connectDB=async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Mongo database Connected successfully");
    } catch (error) {
        console.error("Error connecting Database",error.message);
        process.exit(1);
    }
}

module.exports=connectDB;