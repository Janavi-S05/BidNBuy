const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const biddingSchema = mongoose.Schema({
    user: {
        type:mongoose.Schema.Types.ObjectId,
        require:true,
        ref:"User",
    },
    product: {
        type:mongoose.Schema.Types.ObjectId,
        require:true,
        ref:"Product",
    },
    price: {
        type:Number,
        require:true,
    },
}) 

const bidding = mongoose.model("bidding", biddingSchema);
module.exports = bidding;