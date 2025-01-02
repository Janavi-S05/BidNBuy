const mongoose = require("mongoose");
const categorySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            require: true,
            ref: "User",
        },
        title: {

            type: String,
            required: [true, "Title is required"],
        },
    },
    {
        timestamps: true,
    }
);

const category = mongoose.model("Category",categorySchema);
module.exports=category; 