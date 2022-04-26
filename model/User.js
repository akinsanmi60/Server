const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
    set: (v) => v.toLowerCase,
  },
  roles: {
    User: {
      type: Number,
      default: 2001,
    },
    Driver: Number,
    Famer: Number,
    Admin: Number,
  },
  password: {
    type: String,
    required: true,
  },
  refreshToken: String,
});

module.exports = mongoose.model("User", userSchema);
