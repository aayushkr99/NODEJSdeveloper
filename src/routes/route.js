const express = require("express")
const route = express.Router()
const {createLike,likedByMe} = require("../controller/likeController")
const {userRegister, userLogin} = require("../controller/userController")
const{createPost ,deletePostbyId , postCount, updatePost} = require("../controller/userPostController")
const{createProfile ,profileDetails, followUN, followerCount , followingCount , editProfile} = require("../controller/profileController")
const {authentication} = require("../middleWare/auth")



route.post("/register", userRegister)
route.post("/login", userLogin)


route.post("/post" ,authentication , createPost)
route.delete("/delete/:postId" , authentication, deletePostbyId)

route.post("/createProfile" ,authentication, createProfile)
route.put("/followUnfollow/:userId1/:userId2",authentication, followUN)


route.get("/follower/:userId", authentication , followerCount)
route.get("/following/:userId", authentication ,followingCount)
route.get("/postCount/:userId",authentication, postCount)
route.get("/profileDetails/:userId",authentication, profileDetails)

route.put("/editPost/:postId" ,authentication, updatePost)
route.put("/editProfile/:profileId" , authentication ,editProfile)

route.post("/likedPost",authentication,createLike)
route.get("/likedByMe/:userId" ,authentication, likedByMe)


module.exports = route