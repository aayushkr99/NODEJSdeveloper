const jwt = require('jsonwebtoken');

///////////////////////////////////////////////StART////////////////////////////////////////////////////////////////////////////////////
exports.authentication = (req, res, next) => {
    try {
      let token = req.headers["x-Api-key"];                  
      if (!token) {                                     
        token = req.headers["x-api-key"];                 
      }
      if (!token) {
        return res.status(401).send({ status: false, msg: "Token must be present" });
      }
      let decodedToken = jwt.verify(token, "NODEJS" )      
      if(decodedToken){ 
      req.decodedToken = decodedToken;
      next();       
      }                                                       
    }
    catch (err) {
        console.log(err)
      res.status(500).send({ status: false, msg: err.message });
    }
  }
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////