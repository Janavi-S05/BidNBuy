const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const slugify = require("slugify");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
console.log(cloudinary.config());
const createProduct = asyncHandler(async (req, res) => {
    const { title, description, category, price, height, lengthPic, width, mediumused, weight } = req.body;
    const userId = req.user.id;

    const originalSlug = slugify(title, {
        lower: true,
        remove: /[*+~.()'"!:@]/g,
        strict: true,
    });
    let slug = originalSlug;
    let suffix = 1;

    while (await Product.findOne({ slug })) {
        slug = `${originalSlug}-${suffix}`;
        suffix++;
    }

    if (!title || !description || !price) {
        res.status(400).json({ error: true, message: "Fill all the required fields" });
    }

    let fileData = {};
    if (req.file) {
        let uploadedFile;
        try {
            uploadedFile = await cloudinary.uploader.upload(req.file.path, {
                folder: "Bidding/Product",
                resource_type: "image",
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: true, message: "Image could not be uploaded" });
        }

        fileData = {
            fileName: req.file.originalname,
            filePath: uploadedFile.secure_url,
            fileType: req.file.mimetype,
            public_id: uploadedFile.public_id,
        };
    }
    const product = await Product.create({
        user: userId,
        title,
        slug: slug,
        description,
        category,
        price,
        height,
        lengthPic,
        width,
        mediumused,
        weight,
        image: fileData
    })
    res.status(201).json({ success: true, data: product });

})

// All the user prods
const getAllProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({}).sort("-createdAt").populate("user");
    res.json(products);
})


const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
        return res.status(404).json({ error: true, message: "Product not found" });
    }

    //check if post created user is same as the delete product 
    if (product.user?.toString() !== req.user.id) {
        return res.status(401).json({ error: true, message: "User not authorized" });
    }

    //delete prod from cloudinary
    if (product.image && product.image.public_id) {
        try {
            await cloudinary.uploader.destroy(product.image.public_id)
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: true, message: "Error deleting the image" });
        }
    }

    await Product.findByIdAndDelete(id);
    res.status(200).json({ message: "Product deleted from cloudinary" });
})


const updateProduct = asyncHandler(async (req, res) => {
    const { title, description, category, price, height, lengthPic, width, mediumused, weight } = req.body;
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
        res.status(404).json({ error: true, message: "Product not found" });
    }

    if (product.user?.toString() !== req.user.id) {
        res.status(401).json({ error: true, message: "User not authorized" });
    }

    let fileData = {};
    if (req.file) {
        let uploadedFile;
        try {
            uploadedFile = await cloudinary.uploader.upload(req.file.path, {
                folder: "Bidding/Product",
                resource_type: "image",
            })
        } catch (error) {
            return res.status(500).json({ error: true, message: "Image could not be uploaded" });
        }

        if (product.image && product.image.public_id) {
            try {
                await cloudinary.uploader.destroy(product.image.public_id);
            } catch (error) {
                console.log("Error in deleting the image from cloudinary", error);
            }
        }

        fileData = {
            fileName: req.file.originalname,
            filePath: uploadedFile.secure_url,
            fileType: req.file.mimetype,
            public_id: uploadedFile.public_id,
        };
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        { _id: id },
        {
            title,
            description,
            price,
            height,
            lengthPic,
            width,
            mediumused,
            weight,
            image: Object.keys(fileData).length === 0 ? Product?.image : fileData,
        },
        {
            new: true,
            runValidators: true,
        }
    );
    res.status(200).json(updatedProduct);
})

//that specific logged in user prods
const getAllUserProducts = asyncHandler(async(req,res)=>{
    const userId = req.user._id;
    console.log(req.user._id);
    // if (!mongoose.Types.ObjectId.isValid(userId)) {
    //     return res.status(400).json({ error: true, message: "Invalid user ID" });
    // }
    const products = await Product.find({user:userId}).sort("-createdAt").populate("user");
    res.json(products);
})

const verifyAddCommission = asyncHandler(async(req,res)=>{
    const {commission} = req.body;
    const {id}= req.params;

    const product = await Product.findById(id);
    if(!product){
        return res.status(404).json({error:true,message:"Product not found"});
    }

    product.isVerify = true;
    product.commission = commission;
    await product.save();
    res.status(200).json({message:"Product verified successfully", data:product});
})

const getAllProductsByAdmin = asyncHandler(async(req,res)=>{
    const products = await Product.find({}).sort("-createdAt").populate("user");
    res.json(products);
})

const deleteProductsByAdmin = asyncHandler(async(req,res)=>{
    const { productIds } = req.body;  // Expecting an array of IDs

    if (!productIds || productIds.length === 0) {
        return res.status(400).json({ error: true, message: "No product IDs provided" });
    }

    // Find all products to delete (for cloudinary image removal)
    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length === 0) {
        return res.status(404).json({ error: true, message: "Products not found" });
    }

    // Delete images from Cloudinary
    for (let product of products) {
        if (product.image && product.image.public_id) {
            try {
                await cloudinary.uploader.destroy(product.image.public_id);
            } catch (error) {
                console.error("Cloudinary deletion error:", error);
                return res.status(500).json({ error: true, message: "Error deleting product images" });
            }
        }
    }

    // Bulk delete products from DB
    await Product.deleteMany({ _id: { $in: productIds } });

    res.status(200).json({
        success: true,
        message: "Products deleted successfully",
        deletedCount: products.length
    });
})

const getProduct = asyncHandler(async(req,res)=>{
    const {id} = req.params;
    const product = await Product.findById(id);

    if(!product)
    {
        return res.status(404).json({error:true,message:"Product not found"});
    }
    res.status(200).json(product);
})

const getAllSoldProducts = asyncHandler(async(req,res)=>{
    const products = await Product.find({isSoldOut:true}).sort("-createdAt").populate("user");
    res.json(products);
})

module.exports = {
    createProduct,
    getAllProducts,
    getProduct,
    deleteProduct,
    updateProduct,
    getAllUserProducts,
    verifyAddCommission,
    getAllProductsByAdmin,
    deleteProductsByAdmin,
    getAllSoldProducts
};