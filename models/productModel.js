const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: "User",
    },
    title: {
        type: String,
        require: [true, "Add a title"],
        trime: true,
    },
    slug:{
        type:String,
        unique:true,
    },
    description: {
        type: String,
        require: [true, "Add a description"],
        trime: true,
    },
    image: {
        type: Object,
        default: {},
    },
    category: {
        type: String,
        require: [true, "Add a category"],
        default: "All",
    },
    commission: {
        type: Number,
        default: 0,
    },
    price: {
        type: Number,
        require: [true, "Add a price"],
    },
    height: {
        type: Number
    },
    lengthPic: {
        type: Number
    },
    width: {
        type: Number
    },
    mediumused: {
        type: String
    },
    weight: {
        type: Number
    },
    isVerify: {
        type: Boolean,
        default: false
    },
    isSoldOut: {
        type: Boolean,
        default: false
    },
    soldTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
})

const Product = mongoose.model("Product", productSchema);
module.exports = Product;