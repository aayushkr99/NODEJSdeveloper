const mongoose = require("mongoose");
const jwt  = require("jsonwebtoken")
const userModel = require("../model/userModel");
const counterModel = require("../model/counterModel");
const {
  isValid,
  isValidBody,
  isValidString,
  emailRegex,
  phoneRegex,
  passRegex,
} = require("../validation/validator");



//////////////////////////////////////////////////START/////////////////////////////////////////////////////////////////////////


exports.userRegister = async function (req, res) {
  try {
    let { name, userName, email, password, phone, gender, profile, user_id } =
      req.body;

    if (!isValidBody(req.body))
      return res.status(400).send({ msg: "Please provide details" });

    if (!isValid(name) && !isValidString(name))
      return res
        .status(400)
        .send({ msg: "Please provide the valid Name, only alphabets" });

    if (!isValid(userName))
      return res.status(400).send({ msg: "Please provide the userName" });

    if (!isValid(email))
      return res.status(400).send({ msg: "Please provide the emailId" });

    if (!emailRegex(email))
      return res.status(400).send({ msg: "Please provide valid emailId" });

    const checkEmail = await userModel.find({ email: email });
    if (checkEmail.length !== 0)
      return res.status(400).send({ msg: "emailId is already present" });

    if (!isValid(password))
      return res.status(400).send({ msg: "Please provide the password" });

    if (!passRegex(password))
      return res
        .status(400)
        .send({
          msg: "password should have atleast one lowerCase , one upperCase ,one special character , minLen 8 , maxLen 15",
        });

    if (!isValid(phone))
      return res.status(400).send({ msg: "Please provide the phone" });

    if (!phoneRegex(phone))
      return res.status(400).send({ msg: "Please provide valid phone number" });

    const checkPhone = await userModel.find({ phone: phone });
    if (checkPhone.length !== 0)
      return res.status(400).send({ msg: "Phone number is already present" });

    if (!isValid(gender))
      return res.status(400).send({ msg: "Please tell your gender" });

    if (["male", "female","others"].indexOf(gender) == -1) 
      return res.status(400).send({ msg: "please select valid gender male or female" });

    if (profile) {
      if (gender.includes(["public", "private"]) == -1)
        return res
          .status(400)
          .send({ msg: "profile can only be public or private" });
    }

    let check = await counterModel.findOneAndUpdate(
      { user_id: "autoval" },
      { $inc: { seq: 1 } },
      { new: true }
    );
    let seqId;
    if (check === null) {
      let data = { user_id: "autoval", seq: 1 };
      const newVal = await counterModel.create(data);
      seqId = 1;
    } else {
      seqId = check.seq;
    }
    req.body.user_id = seqId;
    const createUser = await userModel.create(req.body);
    res.status(201).send({ data: createUser });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err: err.message });
  }
};
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




exports.userLogin = async function(req, res){

    try {
    const {email , password} = req.body
    if (!isValidBody(req.body))
    return res.status(400).send({ msg: "Please provide details" });
    
    if (!isValid(email))
      return res.status(400).send({ msg: "Please provide the emailId" });

    if (!emailRegex(email))
      return res.status(400).send({ msg: "Please provide valid emailId" });

    if (!isValid(password))
      return res.status(400).send({ msg: "Please provide the password" });  

    if (!passRegex(password))
      return res
        .status(400)
        .send({
          msg: "password should have atleast one lowerCase , one upperCase ,one special character , minLen 8 , maxLen 15",
        });
    
        
    let findData = await userModel.findOne({email : email , password : password})    
    if(!findData) return res.status(404).send({msg : "Invalid emailId or password"})

    const token = jwt.sign({userId : findData._id} , "NODEJS" , { expiresIn: '10000s' })
    res.setHeader("x-api-key", token);
    res.status(200).send({status: true, data: "logged in successfully", token:  token })

    }
    catch(err){
        console.log(err)
        return res.status(500).send({status : false , err : err.message})
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
