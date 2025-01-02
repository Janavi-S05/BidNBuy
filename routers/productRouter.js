const express = require("express");
const { createProduct, getAllProducts, deleteProduct, updateProduct, getAllUserProducts, verifyAddCommission, getAllProductsByAdmin, deleteProductsByAdmin, getProduct, getAllSoldProducts } = require("../controllers/productController");
const { protect, isSeller, isAdmin } = require("../middleware/authMiddleware");
const {upload} = require("../utils/fileUpload");
const router = express.Router();

router.post("/",protect,isSeller,upload.single("image"),createProduct);
router.get("/",getAllProducts);
router.get("/sold",getAllSoldProducts);
router.get("/user",protect,getAllUserProducts);
router.get("/:id",getProduct);
router.delete("/:id",protect,isSeller,deleteProduct);
router.put("/:id",protect,isSeller,upload.single("image"),updateProduct);

//only accessed by admin user
router.patch("/admin/product-verified/:id", protect,isAdmin, verifyAddCommission);
router.get("/admin/products", protect,isAdmin, getAllProductsByAdmin);
router.delete("/admin/products", protect,isAdmin, deleteProductsByAdmin);

module.exports=router;