const postModel = require("../model/postModel")
const userModel = require("../model/userModel")
const jwt = require("jsonwebtoken")
const aws = require("../aws/aws")
const {isValid, isValidBody, isValidObjectId} = require("../validation/validator")


/////////////////////////////////////////////////START//////////////////////////////////////////////////////////////////////////////

exports.createPost = async function(req,res){
    try {
        let {text , status, userId} = req.body

    if(!isValidBody(req.body))  return res.status(400).send({status : false, msg : "post cannot be empty"})
    if (!isValid(userId)) return res.status(404).send({ status : false,msg: "userId is compulsory" })
    if(!isValidObjectId(userId)) return res.status(400).send({status : false, msg : "userId should be valid"})

    const checkId = await userModel.findById(userId);
    if (!checkId)
        return res.status(400).send({ status: false, msg: "UserId not found" });

    let decodedTokens= req.decodedToken.userId     // AUTHORIZATION
      if(userId!= decodedTokens){
        return res.status(403).send({
            status: false,
            msg: "you cannot create post with any others userId"
            })
    }    

    if(!isValid(text)) return res.status(400).send({status :false , msg : "post cannot have empty text"})

    
    const check = await postModel.find({ text: text });
    if (check.length !== 0)
      return res.status(400).send({ msg: "text should be unique" });

    if(status){
        if(!["public" , "private"].includes(status)) return res.status(400).send({status : false , msg  : "status can either be public or private"})
    }

    let files = req.files
    if (!(files && files.length > 0)) {return res.status(400).send({status : false , message : "postImage is required"})}
        let updatedFileUrl = await aws.uploadFile(files[0])
        req.body.postImage = updatedFileUrl 


        let savedPost = await postModel.create(req.body)
        res.status(201).send({status: true , msg : "post created successfully" , data : savedPost})
}catch(err){
    console.log(err)
    return res.status(500).send({ status : false , err : err.message})
}
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



exports.deletePostbyId = async function (req, res) {
    try {
        const postId = req.params.postId
        if(!isValidObjectId(postId)) return res.status(400).send({status : false , msg : "postId is not valid"})

        let auth = await postModel.findById(postId).select({userId : 1,_id:0 })//.lean()
        
        let decodedTokens= req.decodedToken.userId     // AUTHORIZATION
        if(auth.userId != decodedTokens){
         return res.status(403).send({
          status: false,
          msg: "Not Authorized"
          })
  }    
        let deletePost = await postModel.findOneAndUpdate({ _id: postId, isDeleted: false }, { $set: { isDeleted: true, deletedAt: new Date() } }, { new: true })
        if (!deletePost) return res.status(404).send({ status: false, msg: "no such post exist" })
        res.status(200).send({ status: true, msg: "Post is deleted successfully" })
    }
    catch (err) {
        console.log(err)
        res.status(500).send({ status: false, msg: "error", err: err.message })
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




exports.postCount = async function(req, res){
    try{
        let userId = req.params.userId
        if(!isValidObjectId(userId)) return res.status(400).send({status : false , msg : "userId is not valid"})
        let check = await postModel.find({userId : userId}).count()
        if(!check) return res.status(400).send({status : false, msg : "userId not found or incorrect"})
        res.status(500).send({status : true , data  : check})

    }catch(err){
        console.log(err)
        return res.status(500).send({status : false , err : err.message})
    }
}



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.updatePost = async function(req,res){
    try{
        let postId = req.params.postId
        if (!isValidObjectId(postId)) return res.status(400).send({ status: false, message: "postId is invalid" })

        let data = req.body
   
        const {text , status , isDeleted} = data
        const obj = {}
        const findPost = await postModel.findById(postId)

        if (!findPost) {
        return res.status(404).send({ status: false, message: 'post does not exists' }) }
                
        if(findPost.isDeleted == true){
        return res.status(400).send({ status:false, message: "post is deleted" }) }

        if (!isValidBody(req.body)) { 
        return res.status(400).send({ status: false, message: "Invalid request Please provide details" })  }

        let auth = await postModel.findById(postId).select({userId : 1,_id:0 })//.lean()
  
        let decodedTokens= req.decodedToken.userId     // AUTHORIZATION
        if(auth.userId != decodedTokens){
         return res.status(403).send({
          status: false,
          msg: "Not Authorized"
          })
      }     
        if(text){
            if (!isValid(text)) return res.status(400).send({ status: false, message: "please provide valid text" })
        obj['text'] = text}

        if(status){
            if(!["public" , "private"].includes(status)) return res.status(400).send({status : false , msg  : "status can either be public or private"})
        obj['description'] = description }

        let files = req.files                                                      
        if (files && files.length > 0) {
            let updatedFileUrl = await aws.uploadFile(files[0])
            data.postImage = updatedFileUrl
            obj['postImage'] = updatedFileUrl;}    

        
        let upCheck = await postModel.findOneAndUpdate({_id : postId , isDeleted : false } , obj , {new : true})    
        if(!upCheck == null) return res.status(404).send({status : false , message : "Post not found"})
        return res.status(200).send({status : true, message : "Post edited successfully" , data : upCheck})
    }
    catch (err){
        console.log(err)
        res.status(500).send({status : false , err : err.message})
    }
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////