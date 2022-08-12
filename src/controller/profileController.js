const userModel = require("../model/userModel")
const profileModel = require("../model/profileModel")
const aws = require("../aws/aws")
const {isValid, isValidBody, isValidObjectId, isValidString, pincodeRegex} = require("../validation/validator")

/////////////////////////////////////////////////////////////START/////////////////////////////////////////////////////////////////

exports.createProfile = async function(req , res){
    try {
        let {bio, userId , address, DOB} = req.body
         
        if (!isValidBody(req.body)) { 
            return res.status(400).send({ status: false, message: "Invalid request Please provide details" })  }
        if(!isValidObjectId(userId)) return res.status(400).send({status : false , msg : "Invalid UserId"})
        let check = await userModel.findById(userId).select({createdAt : 0 , updatedAt : 0,__v : 0,_id:0})
        if(!check) return res.status(404).send({status : false , msg : "UserId Not found"})    


       let decodedTokens= req.decodedToken.userId     // AUTHORIZATION
       if(userId!= decodedTokens){
         return res.status(403).send({
          status: false,
           msg: "Not Authorized"
          })
        }    

        if (!isValid(bio)) return res.status(400).send({ status: false, message: "please provide bio details" })

        if (!(address)) return res.status(400).send({ status: false, message: "Address is required" });  

        if (!(address.street )) {
            return res.status(400).send({ status: false, message: "please provide street address" })
        }

        if (!(address.city && isValidString(address.city) )) {
            return res.status(400).send({ status: false, message: "please provide valid city address" })
        }

        if (!(address.pincode && pincodeRegex(address.pincode))) {
            return res.status(400).send({ status: false, message: "please provide valid pincode" })
        }
   
        let dateFormatt = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
        if (DOB) {
            if (!dateFormatt.test(DOB))   return res.status(409).send({ status: false, msg: " date must be in yyyy-mm-dd" });   
        }
        

        let files = req.files
        if (!(files && files.length > 0)) {return res.status(400).send({status : false , message : "profileImage is required"})}
            let updatedFileUrl = await aws.uploadFile(files[0])
            req.body.profileImage = updatedFileUrl 
        
       
            let savedPost = await profileModel.create(req.body)
            res.status(201).send({status: true , msg : "profile saved Successfully" , data : savedPost})
        
    }catch(err){
        console.log(err)
        return res.status(500).send({status : false , err : err.message})
    }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


exports.followUN = async function(req , res){
    try {
    let { follow , unfollow} = req.body
    let {userId1, userId2} = req.params
    if(!isValidObjectId(userId1) && !isValidObjectId(userId2) ) return res.status(400).send({status : false , msg : "IDs are not valid"})

    if(follow){
        let check = await profileModel.findOneAndUpdate({userId:  userId2},{ 
            $inc : {
                follower : 1
            },
        // $push : {
        //     followerId : userId1
        // }
    }, {new: true})

    let check1 = await profileModel.findOneAndUpdate({userId : userId1},{ 
        $inc : {
            following : 1
        },
    // $push : {
    //     followingId : userId2
    // }
},{new: true})

    if(!check) return res.status(404).send({status : false , msg : "User follower Not found"})
    if(!check1) return res.status(404).send({status : false , msg : "User Not found"})
 

    return res.status(200).send({status : true , data : check1})
    }

    if(unfollow){
        let check = await profileModel.findOneAndUpdate({userId :userId1},{ 
            $inc : {
                following: -1
            },
        // $pull : {
        //     followingId : userId2
        // }
    }, {new: true})

    let check1 = await profileModel.findOneAndUpdate({userId :userId2},{ 
        $inc : {
            follower: -1
        },
    // $pull : {
    //     followerId : userId1
    // }
}, {new: true})

if(!check) return res.status(404).send({status : false , msg : "User follower Not found"})
if(!check1) return res.status(404).send({status : false , msg : "User Not found"})

    if(check.following < 0) {
        let change = await profileModel.findOneAndUpdate({userId : userId1}, {$set : {following : 0}} , {new : true})
        check.following = 0

    }
    if(check1.follower < 0){
        let change1 = await profileModel.findOneAndUpdate({userId : userId2}, {$set : {follower : 0}} , {new : true})
        check1.follower = 0
    }
     return res.status(200).send({status : true ,data : check})
    }
}
catch(err){
    console.log(err)
    return res.status(500).send({status : false, err : err.message})
 }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


exports.profileDetails = async function(req ,res){
    try{
        let userId = req.params.userId
        if(!isValidObjectId(userId)) return res.status(400).send({status : false, msg : "userId is not valid"})
        let check = await userModel.findById({_id : userId}).select({createdAt : 0, updatedAt : 0, __v : 0 }).lean()
        if(!check) return res.status(404).send({status : false , msg : "Not found"})
        let profileCheck = await profileModel.findOne({userId : userId}).lean()
        check["follower"] = profileCheck.follower
        check["following"] = profileCheck.following
        check["bio"] = profileCheck.bio
        res.status(200).send({status : true , data : check})

    }catch(err){
        console.log(err)
        return res.status(500).send({status : false , err : err.message})
    }

}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



exports.followerCount = async function(req,res){
 try{
    let userId = req.params.userId
    if(!isValidObjectId(userId)) return res.status(400).send({status : false, msg : "userId is not valid"})
    let check = await profileModel.findOne({userId : userId}).select({follower:1, _id : 0})//.count()
    if(!check) return res.status(400).send({status : false, msg : "userId not found or incorrect"})
    res.status(200).send({status : true , data : check})
}catch(err){
    console.log(err)
    return res.status(500).send({status  : false , err : err.message})
}
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


exports.followingCount = async function(req,res){
    try{
       let userId = req.params.userId
       if(!isValidObjectId(userId)) return res.status(400).send({status : false, msg : "userId is not valid"})
       let check = await profileModel.findOne({userId:userId}).select({following:1 , _id : 0})//.count()
       if(!check) return res.status(400).send({status : false, msg : "userId not found or incorrect"})
       res.status(200).send({status : true , data : check})
   }catch(err){
       console.log(err)
       return res.status(500).send({status  : false , err : err.message})
   }
   }

///////////   //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



exports.editProfile = async function(req,res){
    try{
        let profileId = req.params.profileId
        if (!isValidObjectId(profileId)) return res.status(400).send({ status: false, message: "profileId is invalid" })

        let data = req.body
   
        const {bio ,address , DOB} = data
        const obj = {}
        const findProfile = await profileModel.findById(profileId)

        if (!findProfile) {
        return res.status(404).send({ status: false, message: 'profile does not exists' }) }
     
        if (!isValidBody(req.body)) { 
        return res.status(400).send({ status: false, message: "Invalid request Please provide details" })  }

        let auth = await profileModel.findById(profileId).select({userId : 1,_id:0 })//.lean()
        
        let decodedTokens= req.decodedToken.userId     // AUTHORIZATION
        if(auth.userId != decodedTokens){
         return res.status(403).send({
          status: false,
          msg: "Not Authorized"
          })
        }   
        if(bio){
            if (!isValid(bio)) return res.status(400).send({ status: false, message: "please provide bio details" })
        obj['bio'] = bio}
        
        if(address){
        if (!(address.street )) {
            return res.status(400).send({ status: false, message: "please provide street address" }) }
        
        if (!(address.city )) {
            return res.status(400).send({ status: false, message: "please provide valid city address" })
        }
        if (!(address.pincode )) {
            return res.status(400).send({ status: false, message: "please provide valid pincode" })
        }
        obj["address"] = address
    }
    
        let dateFormatt = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
        if (DOB) {
            if (!dateFormatt.test(DOB))   return res.status(409).send({ status: false, msg: " date must be in yyyy-mm-dd" });   
            obj["DOB"] = DOB
        }

        let files = req.files                                                      
        if (files && files.length > 0) {
            let updatedFileUrl = await aws.uploadFile(files[0])
            data.profileImage = updatedFileUrl
            obj['profileImage'] = updatedFileUrl;}    

        let upCheck = await profileModel.findByIdAndUpdate({_id : profileId } , obj , {new : true})    
        if(!upCheck == null) return res.status(404).send({status : false , message : "profile not found"})
        return res.status(200).send({status : true, message : "Profile edited successfully" , data : upCheck})
    }
    catch (err){
        console.log(err)
        return res.status(500).send({status : false , err : err.message})
    }
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////