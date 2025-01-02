const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

const protect = asyncHandler(async(req,res,next)=>{
    try{
        const token = req.cookies.token;
        if(!token){
            return res.status(401).json({error:true,message:"Not authorised to access this page, Please login"});
        }

        const verified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(verified.userId).select("-password");

        if(!user){
            return res.status(401).json({error:true,message:"User not found"});
        }

        req.user = user;
        next();
    }catch(error){
        console.error("JWT Verification Error: ", error.message);
        return res.status(401).json({error:true,message:"Invalid token, Please login again"});
    }
})

const isAdmin =(req,res,next)=>{
    if(req.user && req.user.role ==="admin")
    {
        next();
    }else{
        res.status(403).json({error:true,message:"Access denied.Not an admin"});
    }
}

const isSeller =(req,res,next)=>{
    if(req.user && req.user.role ==="seller" || req.user.role === "admin")
    {
        next();
    }else{
        res.status(403).json({error:true,message:"Access denied.Not a seller"});
    }
}
module.exports = {protect,isAdmin,isSeller};