const mongoose = require("mongoose");
const env =require("dotenv").config();

const connectDB = async ()=>{
    try {
        await mongoose.connect(process.env.MONGODB_URI,{ autoIndex: false}); // auto indexes schemas turned off 
        console.log("Database Connected Successfully");
        
    } catch(error){
        console.log("Database Connection Failed",error.message);
        process.exit(1);
    }
}

module.exports = connectDB; 
