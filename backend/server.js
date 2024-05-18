//import express
const express = require("express");
//import dummy data
const {chats} = require("./data/data");
const dotenv =require("dotenv");
const connectDB=require("./config/db");
const {notFound} = require("./middlewares/errorMiddleware");
const userRoutes=require("./routes/userRoutes");
const chatRoutes=require("./routes/chatRoutes");
//create instance
const app =express()
dotenv.config();
connectDB();
// creating get request
app.use(express.json()); //to accept json data from frontend
app.get('/',(req,res)=>{
    res.send("API IS RUNNING SUCCESSFULLY");create
});  
//endpoint for user
app.use('/api/user',userRoutes);
app.use('api/chat',chatRoutes);
//
app.use(notFound);
// app.use(errorHandler);
// 
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: `Internal Server Error: ${err}` });
});

const PORT=process.env.PORT || 5000
// create own server
app.listen(PORT,console.log("Server started on PORT 5000"));