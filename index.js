const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const cookieParser = require("cookie-parser");

require("./src/db/mongoose");
const publicDirectory = path.join(__dirname, "/public");
const userRouter = require("./src/routers/userRouter");
const bucketRouter = require("./src/routers/bucketsRouter");
const port = process.env.PORT;

app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(express.static(publicDirectory));
app.use(userRouter);
app.use(bucketRouter);


app.listen(port, ()=>{
    console.log("Server connected, port: ", port);
})
