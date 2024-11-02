const express = require ('express');
const  app = express();
const path = require('path');
const session = require('express-session');
const env = require('dotenv').config();
const db = require('./config/db')
const userRouter = require("./routes/userRouter")
db.connectDB()

app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.set('view engine',"ejs")
app.set('views',[path.join(__dirname, 'views/user'),path.join(__dirname,'views/admin')])
app.use(express.static(path.join(__dirname,"public")));


app.use('/',userRouter);

app.listen(process.env.PORT,()=>{
    console.log(`http://localhost:${process.env.PORT}`);
    
})