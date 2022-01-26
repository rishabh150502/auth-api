const express = require('express');
const mongoose = require('mongoose');
const cookieParser =require('cookie-parser');

const app = express();

require('dotenv').config();

const port = process.env.PORT || 3001;


//database
const uri = process.env.ATLAS_URI;
mongoose.connect(uri,{
    useNewUrlParser: true,
    useUnifiedTopology: true
}).catch(e=>{
    console.log(e.message)
});
const connection=mongoose.connection;
connection.once('open',()=>{
    console.log("Database Connected");
});

//middleware
app.use(express.json());
app.use(cookieParser());


//routes
const authRouter = require('./routers/auth');
const changePasswordRouter = require('./routers/forgotPassword')
app.use('/api/auth',authRouter);
app.use('/api/resetpassword',changePasswordRouter);



app.listen(port,()=>{
    console.log(`Server started on port: ${port}`);
})