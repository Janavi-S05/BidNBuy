const mongoose = require("mongoose");

const connectDb = async () => {
    try {
        const connectionString = process.env.CONNECTION_STRING;
        const connect = await mongoose.connect(connectionString);
        console.log("Database connected:", connect.connection.host, connect.connection.name);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

module.exports = connectDb;