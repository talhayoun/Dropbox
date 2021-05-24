const express = require("express");
const router = new express.Router();
const { changeBucketPolicy, createBucket, deleteBucket, uploadImageToS3, deleteObjectFromBucket} = require("../middleware/s3-handlers");
const User = require("../models/userSchema");
const auth = require("../middleware/auth");

router.post("/create-bucket",auth, createBucket, changeBucketPolicy, async(req, res)=>{
    try{
        console.log(req.body, "bucket")
        req.user.bucket = req.body.bucket;
        await req.user.save();
        res.send()

    }catch(err){
        res.status(404).send("Failed to create bucket")
    }
})

router.delete("/delete-bucket", auth, deleteBucket, async(req, res)=>{
    try{
        req.user.bucket = null;
        await req.user.save()
        res.send()

    }catch(err){
        res.status(404).send("Failed to delete bucket");
    }
})

router.post("/upload-file", auth, uploadImageToS3, async(req, res)=>{
    try{
        console.log("--", req.file)
        req.user.files = req.user.files.concat({file:req.file.key})
        await req.user.save()
        res.send()
    }
    catch(err){
        res.status(404).send("Failed to upload")
    }
})

router.delete("/delete-object", auth, deleteObjectFromBucket, async(req, res)=>{
    req.user.files = req.user.files.filter((files) => files.file !== req.body.file)
    await req.user.save()
    res.send();
})

module.exports = router;