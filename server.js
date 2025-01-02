const dotenv = require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors=require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const userRoute = require("./routers/userRouter");
const productRoute = require("./routers/productRouter");
const biddingRoute = require("./routers/biddingRouter");
const categoryRoute = require("./routers/categoryRouter");
const connectDb = require("./database/dbConnection");
const errorHandler = require("./middleware/errorMiddleWare");
console.log("Cloudinary API Key:", process.env.CLOUDINARY_API_KEY);
connectDb();

const app=express();

app.use(express.json())
app.use(cookieParser());

app.use(
    express.urlencoded({
        extended:false,
    })
);

app.use(bodyParser.json());

app.use(
    cors({
        origin: ["http://localhost:5000","website domain url"],
        credentials:true,
    })
)

app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/bidding", biddingRoute);
app.use("/api/category", categoryRoute);

app.use(errorHandler);
app.use("/uploads", express.static(path.join(__dirname,"uploads")));

const PORT = process.env.PORT || 5050;
app.listen(PORT, ()=>{
            console.log(`Server running on port ${PORT}`);
        });
app.get("/", (req,res)=>{
    res.send("home");
})

