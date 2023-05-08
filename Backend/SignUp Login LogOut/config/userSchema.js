const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  avtar: { type: String },
  mobile: { type: Number },
  role: {
    type: String,
    required: true,
    enum: ["seller", "user"],
    default: "user",
  },
});

const userModel = mongoose.model("user", userSchema);

module.exports = { userModel };
