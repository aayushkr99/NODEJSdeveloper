const likedModel = require("../model/likedModel")
const postModel = require("../model/postModel")
const userModel = require("../model/userModel")
const {isValidObjectId , isValidBody, isValid} = require("../validation/validator")
const { post } = require("../routes/route")



////////////////////////////////////////////////START//////////////////////////////////////////////////////////////////////////

exports.createLike = async function (req, res) {
    try {
     
        let { likedBy , comments, postId } = req.body
        
        if (!isValidBody(req.body)) {
            return res.status(400).send({ status: false, msg: "please provide  details" })
        }
        if(!isValidObjectId(postId)) return res.status(400).send({status : false , msg  : "postId is incorrect"})

        if(comments){
            if(!isValid(comments))  return res.status(400).send({msg : "comment is required"})
        }

        if(!isValidObjectId(likedBy)) return res.status(400).send({status : false , msg  : "Not a valid userId"})
        let findName = await userModel.findById({_id : likedBy}).select({userName : 1})
        if(!findName) return res.status(404).send({msg : "likedBy id not found"})

        let savedData = await likedModel.create(req.body)
        if (savedData) {
            let newLikes = await postModel.findOneAndUpdate({ _id: postId }, {
                $inc: {
                    likes: 1
                }
            }, { new: true })

        }
        let check1 = await postModel.findOne({ _id: postId }).select({  __v: 0 }).lean()
        const getlikes = await likedModel.find({ postId: postId}).select({ isDeleted: 0 , _id : 0 , __v:0,postId:0})
        check1.likesData = getlikes
        return res.status(201).send({ status: true, data: check1 })

    }
    catch (err) {
        console.log(err)
        res.status(500).send({ status: false, msg: "error", err: err.message })

    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
exports.likedByMe = async function(req,res){
    try{
    let userId = req.params.userId
    if (!isValidObjectId(userId)) {
        return res.status(404).send({
            status: false,
            message: "Invalid userId "
        });
    }

    let decodedTokens= req.decodedToken.userId     // AUTHORIZATION
    if(userId!= decodedTokens){
      return res.status(403).send({
       status: false,
        msg: "Not Authorized"
       })
     }    

    const likedPost = await likedModel.find({ likedBy: userId}).select({_id : 0 , __v : 0})//.lean(); 
    if (!likedPost) {
        return res.status(404).send({
            status: false,
            message: "Document not found"
        });
    }
    res.status(200).send({ status: true, data: likedPost });
} catch(err){
    console.log(err)
     return res.status(500).send({status : false , err : err.message})
}
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////