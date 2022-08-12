const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({

    name : { type: String, required: true, trim: true },
    userName: { type: String, required: true, trim: true },
    gender: { type: String, required: true, enum: ["male" ,"female" , "others"] },
    email: { type: String, trim: true, required: true,  unique: true},
    phone: {  type: String, required: true, unique: true, trim: true},
    password: { type: String, required: true, trim: true},
    profile : {type: String , default : "public" , enum :["public" , "private"] },
    user_id : {type :String}

} , {timestamps : true})

module.exports = mongoose.model("UserInt" , userSchema)