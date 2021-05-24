const AWS = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const s3 = new AWS.S3({region: process.env.AWS_REGION})

const createBucket = async(req, res, next) =>{
    let bucketName = req.body.bucketname + "-" + new Date().getTime();
    try{
      await s3.createBucket({
          Bucket: bucketName,
          ACL: "private", 
          CreateBucketConfiguration: {
          LocationConstraint: "eu-west-1"
          }
      }).promise();
      req.body.bucket = bucketName;
      next();
    }catch(err){
      console.log(err)
    }
}

const changeBucketPolicy = async(req, res, next)=>{
    let bucketName = req.body.bucket;
    const readOnlyAnonUserPolicy = {
        Version: "2012-10-17",
        Statement: [
          {
            Sid: "PublicReadGetObject",
            Effect: "Allow",
            Principal: "*",
            Action: [
              "s3:GetObject"
            ],
            Resource: [
              ""
            ]
          }
        ]
    };

    const bucketResource = "arn:aws:s3:::" + bucketName + "/*";
    readOnlyAnonUserPolicy.Statement[0].Resource[0] = bucketResource;
    const bucketPolicyParams = {Bucket: bucketName, Policy: JSON.stringify(readOnlyAnonUserPolicy)};
    await s3.putBucketPolicy(bucketPolicyParams).promise();
    next()
}
const changeBucketStaticHosting = async(req, res, next) =>{
    await s3.putBucketWebsite({
        Bucket: req.body.bucket,
        WebsiteConfiguration: {
            ErrorDocument: {
            Key: 'error.html'
            },
            IndexDocument: {
            Suffix: 'index.html'
            },
        }
    })
    next();
}

const deleteBucket = async(req, res, next)=>{
  await s3.deleteBucket({
    Bucket: req.user.bucket
  }).promise();
  next()
}


const fileStorage = multerS3({
  s3,
  acl: 'private',
  contentType: multerS3.AUTO_CONTENT_TYPE,
  contentDisposition: "inline",
  bucket: (req, file, cb)=>{
    cb(null, req.user.bucket)
  },
  metadata: (req, file, cb) =>{
      cb(null, {fieldName: file.fieldname});
  },
  key: (req, file, cb) => {
      const fileName = new Date().getTime() + "-" + file.originalname;
      cb(null, fileName);
  }
})

const uploadImageToS3 = multer({ storage: fileStorage }).single("file");


const deleteObjectFromBucket = async function(req, res, next){
  console.log(req.body.file)
  await s3.deleteObject({
    Bucket: req.user.bucket,
    Key: req.body.file
  }).promise()
  next();
}

module.exports = { changeBucketPolicy, createBucket, deleteBucket, uploadImageToS3, deleteObjectFromBucket};