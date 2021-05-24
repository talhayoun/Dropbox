const express = require("express");
const User = require("../models/userSchema");
const router = new express.Router();
const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");


router.get("/verify", auth, async(req, res)=>{
    try{
        res.send({bucket: req.user.bucket, files: req.user.files})
    }catch(err){
        res.status(400).send("Verify failed")
    }
})

router.post("/register", async(req, res)=>{
    try{
        console.log(req.body)
        const newUser = await new User({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        })
        console.log(newUser);
        if(!newUser){
            res.status(404).send("Failed to register here");
        }
        await newUser.save()
        res.send();
    }catch(err){
        res.status(404).send("Failed to register");
    }
})

router.post("/login", async(req, res)=>{
    try{
        const findUser = await User.findOne({email: req.body.email})
        if(!findUser){
            return res.status(404).send("Failed to find user, login");
        }
        const isPassMatch = await bcrypt.compare(req.body.password ,findUser.password)
        if(!isPassMatch){
            return res.status(404).send("Password doesn't match, login");
        }
        console.log(isPassMatch)
        const token = await findUser.activateToken();
        console.log("yep")
        res.cookie("token", token).send({username: findUser.username})
        // res.send();
    }
    catch(err){
        res.status(404).send("Failed to activatetoken");
    }
})

router.get("/logout", auth, async(req, res)=>{
    try{
        let currentToken = req.cookies.token
        req.user.tokens.filter((tokens) => tokens.token !== currentToken)
        await req.user.save()
        res.cookie("token", "").send();
    }catch(err){
        res.status(404).send("Failed to logout");
    }
})



module.exports = router;
