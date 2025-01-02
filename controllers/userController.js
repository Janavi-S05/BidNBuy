const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: true, message: "Please fill all the required fields" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ error: true, message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
    });
    await user.save();

    // const token = generateToken(user._id);
    const token = jwt.sign(
        { userId: user._id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "72h" }
    );

    res.cookie("token", token, {
        path: "/",
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400),
        sameSite: "strict",
        secure: true
    });

    // if(user){
    //     const {_id,name,email,photo,role} =user;
    //     res.status(200).json({_id,name,email,photo,role});
    // }else{
    //     res.status(400);
    //     throw new Error("Invalid user data");
    // }
    return res.status(201).json({
        error: false,
        user: { id: user.id, name: user.name, email: user.email, photo: user.photo, role: user.role },
        token,
        message: "Registration successful",
    });
})


const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: true, message: "Add email and password" });
    }

    const user = await User.findOne({ email });
    if (!user) {
        res.status(404).json({ error: true, message: "User not found, Please signup" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        return res.status(400).json({ error: true, message: "Invalid credentials" });
    }

    const token = jwt.sign(
        {
            userId: user._id,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: "72h",
        }
    );

    res.cookie("token", token, {
        path: "/",
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400),
        sameSite: "strict",
        secure: true
    });

    return res.json({
        error:false,
        message:"Login successful",
        user:{name:user.name,email:user.email},
        token,
    })
});


const loginStatus = asyncHandler(async(req,res)=>{
    const token = req.cookies.token;
    if(!token){
        return res.json(false);
    }

    const verified = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
    if(verified){
        return res.json(true);
    }
    return res.json(false);
})

const logOut = asyncHandler(async(req,res)=>{
    res.cookie("token","",{
        path:"/",
        httpOnly:true,
        expires: new Date(0),
        sameSite:"strict",
        secure:true
    })
    return res.status(200).json({message:"logged out"});
});

const loginAsSeller = asyncHandler(async(req,res)=>{
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: true, message: "Add email and password" });
    }

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ error: true, message: "User not found, Please signup" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        return res.status(400).json({ error: true, message: "Invalid credentials" });
    }

    user.role ="seller";
    await user.save();

    const token = jwt.sign(
        {
            userId: user._id,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: "72h",
        }
    );

    res.cookie("token", token, {
        path: "/",
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400),
        sameSite: "strict",
        secure: true
    });

    return res.json({
        error:false,
        message:"Login successful",
        user:{name:user.name,email:user.email,role:user.role},
        token,
    })
})


const getUser = asyncHandler(async(req,res)=>{
    const id =req.user._id;
    const user = await User.findById(id).select("-password");
    res.status(200).json(user);
})

const getuserBalance= asyncHandler(async(req,res)=>{
    const id =req.user._id;
    const user = await User.findById(id);

    if(!user){
        return res.status(404).json({error:true,message:"User not found"});
    }
    res.status(200).json({
        balance:user.balance,
    });
})

const getAllUser = asyncHandler(async(req,res)=>{
    const usersList = await User.find({});

    if(!usersList){
        return res.status(404).json({error:true,message:"User not found"});
    }
    res.status(200).json(usersList);
})

const estimateIncome = asyncHandler(async(req,res)=>{
    try{
        const admin =await User.findOne({role:"admin"});
        if(!admin){
            return res.status(404).json({message:"User not found"});
        }
        const commissionBalance = admin.commissionBalance;
        res.status(200).json({commissionBalance});
    }catch(error){
        res.status(500).json({error:true,message:"Internal server error"});
    }
})

module.exports = {
    registerUser,
    loginUser,
    loginStatus,
    logOut,
    loginAsSeller,
    getUser,
    getAllUser,
    getuserBalance,
    estimateIncome
};