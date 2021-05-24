const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true,
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    tokens: [
        {
            token:{
                type:String,
                required: true,
            }
        }
    ],
    bucket:{
        type:String
    },
    files:[
        {
            file:{
                type:String,
                required: true
            }
        }
    ]
})

userSchema.pre("save", async function(next){
    const user = this;
    if(user.isModified("password")){
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
})

userSchema.methods.activateToken = async function(){
    const user = this;
    console.log("here")
    console.log(process.env.SECRET_TOKEN)
    const token = jwt.sign(
        {
            _id:user._id
        },
        process.env.SECRET_TOKEN,
        {
            expiresIn: "1h"
        }
    )
    console.log("now here")
    user.tokens = user.tokens.concat({token});
    await user.save();
    return token;
}

const User = mongoose.model("user", userSchema);

module.exports = User;