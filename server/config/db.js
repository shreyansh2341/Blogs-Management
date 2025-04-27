const mongoose = require('mongoose');
const connectDB= async()=>{

    try{
        mongoose.set('strictQuery', false);
        const conn = await mongoose.connect(process.env.DB_URI);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    }

    catch(err){
        console.log(err);
    }
}

module.exports = connectDB;