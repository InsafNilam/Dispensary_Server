const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  profile: {
    id: {
      type: String,
      required: [true, "Picture ID is required"],
    },
    url: {
      type: String,
      required: [true, "Picture URL is required"],
    },
  },
  firstName: {
    type: String,
    required: [true, "First Name is required"],
  },
  lastName: {
    type: String,
    required: [true, "Last Name is required"],
  },
  mobileNumber: {
    type: String,
    required: [true, "Mobile Number is required"],
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
});

const User = mongoose.model("users", userSchema);

module.exports = User;
