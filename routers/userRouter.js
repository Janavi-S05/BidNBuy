const express = require("express");
const router = express.Router();
const {registerUser,loginUser, loginStatus, logOut, loginAsSeller, getUser, getuserBalance, getAllUser, estimateIncome} =require("../controllers/userController");
const {protect,isAdmin} = require("../middleware/authMiddleware");

router.post("/register",registerUser);
router.post("/login",loginUser);
router.post("/loginSeller",loginAsSeller);
router.get("/loginStatus",loginStatus);
router.get("/logout",logOut);
router.get("/user",protect,getUser);
router.get("/sellerBalance",protect,getuserBalance);

// only accessible by admin
router.get("/allUsers",protect,isAdmin, getAllUser); 
router.get("/estimateIncome",protect,isAdmin, estimateIncome);
module.exports = router;