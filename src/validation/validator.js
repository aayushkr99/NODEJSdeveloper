const mongoose = require("mongoose")

const isValid = function (value) {
    if (typeof value === "undefined" || value === null ) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
};

const isValidString= function (value) {
    const noNumber =/^[^0-9]+$/g                                   
    if (typeof value !== 'string') return false
    if(noNumber.test(value) === false) return false
    return true
}

const isValidBody = function (requestbody) {
    return Object.keys(requestbody).length > 0;
}

const isValidObjectId = function (ObjectId) {
    return mongoose.Types.ObjectId.isValid(ObjectId)
}

const emailRegex =function (value){            
    const test1 = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/ 
    if (typeof value !== 'string') return false
    if(test1.test(value) === false) return false
    return true
}   
const phoneRegex =function (value){            
    const test2 = /^(\+91[\-\s]?)?[0]?(91)?[6-9]\d{9}$/  
    if (typeof value !== 'string') return false
    if(test2.test(value) === false) return false
    return true
} 
const passRegex =function (value){            
    const test3 = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/ 
    if (typeof value !== 'string') return false
    if(test3.test(value) === false) return false
    return true
} 
const pincodeRegex = function(value) {
    if(!(/^[1-9][0-9]{5}$/.test(value.trim()))) {
        return false
    }
    return true
}
const isValidBoolean = function(value){
    if(!(typeof value === "boolean")) return false
    return true
}
module.exports = {isValid , isValidBody , emailRegex , passRegex , phoneRegex, isValidString, isValidObjectId ,pincodeRegex,isValidBoolean}