const mongoose = require("mongoose");

const mongoURI = "mongodb://0.0.0.0:27017/MERNProject?";

const connectToMongo = async () => {
    try {
        // console.log("try Connected to MongoDB");
        await mongoose.connect(mongoURI);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
    }
};

module.exports = connectToMongo;