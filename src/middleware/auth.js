const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");

const auth = async function(req, res, next){
    try{
        const userCookie = req.cookies.token
        const isVerified = jwt.verify(userCookie, process.env.SECRET_TOKEN);
        console.log(isVerified, "ve")
        if(!isVerified){
            return res.status(404).send("Failed to verify token, auth");
        }
        const findUser = await User.findOne({
            _id: isVerified._id,
            "tokens.token": userCookie
        })
        console.log(findUser, "@@")
        if(!findUser){
            return res.stauts(404).send("Failed to find user with that token");
        }
        req.user = findUser;
        req.token = userCookie
        next()
    }catch(err){
        res.status(404).send("Failed to verify")
    }
}

module.exports = auth;