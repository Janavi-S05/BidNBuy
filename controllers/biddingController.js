const asyncHandler = require("express-async-handler");
const Bidding = require("../models/BiddingModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const sendEmail = require("../utils/sendEmail");

const getBiddinghistory = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const biddingHistory = await Bidding.find({ product: productId }).sort("-createdAt").populate("user").populate("product");
    res.status(200).json(biddingHistory);
});


const placeBid = asyncHandler(async (req, res) => {
    const { productId, price } = req.body;
    const userId = req.user.id;

    const product = await Product.findById(productId);
    console.log(product);
    if (!product.isVerify) {
        return res.status(400).json({ error: true, message: "Bidding is not verified for these products" });
    }

    if (!product || product.isSoldOut === true) {
        return res.json(400).json({ message: "Invalid product or bidding is closed" });
    }

    const existinguserBid = await Bidding.findOne({ user: userId, product: productId });
    if (existinguserBid) {
        if (price <= existinguserBid.price) {
            return res.status(400).json({ message: "Your bid must be higher than your previously bid" });
        }
        existinguserBid.price = price;
        await existinguserBid.save();
        res.status(200).json({ biddingProduct: existinguserBid });
    } else {
        const highestBid = await Bidding.findOne({ product: productId }).sort({ price: -1 });
        if (highestBid && price <= highestBid.price) {
            return res.status(400).json({ message: "Your bid must be higher than the current highest bid" });
        }
        const biddingProduct = await Bidding.create({
            user: userId,
            product: productId,
            price,
        });

        res.status(200).json(biddingProduct);
    }
})


const sellProduct = asyncHandler(async (req, res) => {
    const { productId } = req.body;
    const userId = req.user.id;

    const product = await Product.findById(productId);
    if (product.user.toString() !== userId) {
        return res.status(403).json({ error: "You are not authorized to sell this product" });
    }

    // Find the highest bid price
    const highestBid = await Bidding.findOne({ product: productId }).sort({ price: -1 }).populate("user");
    if (!highestBid) {
        return res.status(400).json({ message: "No winning bid found for the product" });
    }

    if(!product.isSoldOut){
    // Cal commission and final price
    const commissionRate = product.commission;
    const commissionAmount = (commissionRate / 100) * highestBid.price;
    const finalPrice = highestBid.price - commissionAmount;

    // Update product details
    product.isSoldOut = true;
    product.soldTo = highestBid.user;
    product.soldPrice = finalPrice;

    // Update admin's commission balance 
    const admin = await User.findOne({ role: "admin" });
    if (admin) {
        admin.comissonBalance += commissionAmount;
        await admin.save();
    }

    // Update seller's balance
    const seller = await User.findById(product.user);
    if (seller) {
        seller.balance += finalPrice;
        await seller.save();
    } else {
        return res.status(404).json({ error: "Seller not found" });
    }

    await product.save();

    // Send email notification to the highest bidder
    await sendEmail({
        email: highestBid.user.email,
        subject: "Congratulations! You won the auction!",
        text: `You have won the auction for "${product.title}" with a bid of $${highestBid.price}.`,
    });

    res.status(200).json({ message: "Product has been successfully sold!" });
}else{
    return res.status(400).json({ error: true,message:"Invalid product or bidding is closed" });
}

})
module.exports = {
    getBiddinghistory,
    placeBid,
    sellProduct
};