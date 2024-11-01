const app = require ('express')();
const path = require('path');
const session = require('express-session');
const env = require('dotenv').config();
const db = require('./config/db')
db()

app.listen(process.env.PORT,()=>{
    console.log(`http://localhost:${process.env.PORT}`);
    
})