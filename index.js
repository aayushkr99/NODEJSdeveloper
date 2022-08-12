const express = require("express")
const mongoose = require("mongoose")
const route = require('./src/routes/route');

const app = express()
app.use(express.json())

const multer= require("multer");
const { AppConfig } = require('aws-sdk');
app.use( multer().any())


mongoose.connect("mongodb+srv://disha123:hl6LMcJIED1eCZhr@cluster0.hrerz.mongodb.net/NODEJSAssignment", {
    useNewUrlParser : true
})
.then(() => console.log("MongoDB is connected.."))
.catch(err => console.log(err))

app.use('/' , route)

app.listen(3000, () => {
    console.log(`Server is running on port ${3000}`)
})