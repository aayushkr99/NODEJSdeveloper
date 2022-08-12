const mongoose = require("mongoose")


const postSchema = new mongoose.Schema({
    text: { type: String ,required : true, unique : true, trim : true},
    status : {type : String , default : "public" ,enum : ["public" , "private"]},
    postImage: { type: String,  trim: true  },
    likes : {type : Number , default : 0},
    userId: {type: String, ref: 'UserInt',  required: true},
    isDeleted : {type : Boolean, default : false },
    deletedAt : {type : Date}
})
  module.exports = mongoose.model("UserPostNew" , postSchema)