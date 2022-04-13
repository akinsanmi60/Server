const mongoose = require("mongoose");
require("dotenv").config();

// const DB = process.env.DATABASE_URI;
const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://user-akintunde:Akinsanmi60@cluster0.62deh.mongodb.net/AceDB?retryWrites=true&w=majority",
      {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      }
    );
  } catch (err) {
    console.error(err);
  }
};

module.exports = connectDB;
