const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId

const LikedSchema = new mongoose.Schema({

    likedBy: {type :ObjectId, required:true, trim : true , ref : "UserInt"},
    comments: {type :String , trim : true}, 
    postId : {type : String , ref : "UserPost" , required : true }

})

module.exports =  mongoose.model('like', LikedSchema)
