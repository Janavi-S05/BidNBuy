const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    name: {
        type: String,
        require: [true, "Enter your name"],
    },
    email: {
        type: String,
        require: [true, "Enter your email"],
    },
    password: {
        type: String,
        require: [true, "Enter your password"],
    },
    photo: {
        type: String,
        require: [true, "Add your avatar"],
    },
    role: {
        type: String,
        enum: ["admin", "seller", "buyer"],
        default: "buyer",
    },
    commissionBalance: {
        type: Number,
        default: 0,
    },
    balance: {
        type: Number,
        default: 0,
    },
},
    { timeStamp: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;