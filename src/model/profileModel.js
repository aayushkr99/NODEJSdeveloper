const mongoose  = require("mongoose")
 const ObjectId = mongoose.Schema.Types.ObjectId


 const profileSchema = new mongoose.Schema({

    profileImage: { type: String,  trim: true  },
    bio : {type : String, required  : true},
    address: {
          street: { type: String, required: true },
          city: { type: String, required: true },
          pincode: { type: Number, required: true }
      },
    DOB : {type : Date },
    follower : {type : Number,default : 0},
    following : {type : Number,default : 0},
   //  followerId : [{type : ObjectId ,ref :"UserInt"}],
   //  followingId : [{type : ObjectId , ref : 'UserInt'}],
    userId: {type: String, ref: 'UserInt',  required: true,  unique : true}

 })
 
 module.exports = mongoose.model("profileInter" , profileSchema)