const jwt = require("jsonwebtoken");
const { isValidObjectId } = require("mongoose");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const crypto = require("crypto");
const cloudinary = require("../Config/cloudinary");

//import mongoose model
const User = require("../Models/userModel");

// Create new User
const createUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, mobileNumber, email, password } = req.body;
  const file = req.files.profile;

  try {
    if (
      !firstName ||
      !lastName ||
      !mobileNumber ||
      !email ||
      !password ||
      !file
    ) {
      res.status(400).send("please fill all required fields");
    }

    // Check if user alredy exists with provided email
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400).send("This email address is already being used");
    }

    const dataUri = `data:${file.mimetype};base64,${file.data.toString(
      "base64"
    )}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      public_id: crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        } else {
          return (
            buf.toString("hex") + "+" + String(file.name) + "+" + Date.now()
          );
        }
      }),
      resource_type: "image",
      overwrite: true,
      invalidate: true,
      folder: "profiles",
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin
    const user = await User.create({
      profile: {
        id: result.public_id,
        url: result.secure_url,
      },
      firstName,
      lastName,
      mobileNumber,
      email,
      password: hashedPassword,
    });

    if (user) {
      res.status(201).send("User added to the system successfully");
    } else {
      res.status(400).send("Invalid user! please check again");
    }
  } catch (err) {
    console.log(err);
  }
});

// User login
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check details to fetch user email
  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      profile: {
        id: user.profile.id,
        url: user.profile.url,
      },
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      mobileNumber: user.mobileNumber,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).send("Invalid Credentials");
  }
});

const deleteUser = asyncHandler(async (req, res) => {
  const userId = await req.user.id;
  if (!isValidObjectId(userId))
    return res.status(400).send(`No Record with given id : ${userId}`);

  try {
    const user = await User.findById(userId);
    if (user) {
      const id = user.profile.id;

      await cloudinary.uploader.destroy(id);
      User.findByIdAndDelete(userId, (err, doc) => {
        if (!err) res.send(doc);
        else
          console.log(
            "Error in Deleting User Details :" +
              JSON.stringify(err, undefined, 2)
          );
      });
    }
  } catch (err) {
    console.log(err);
  }
});

const updateUser = asyncHandler(async (req, res) => {
  const userId = await req.user.id;
  const app = await req.body;
  const file = req.files.profile;

  if (!isValidObjectId(userId))
    return res.status(400).send(`No Record with given id : ${userId}`);

  if (req.body.password) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    app["password"] = hashedPassword;
  }

  if (file) {
    const dataUri = `data:${file.mimetype};base64,${file.data.toString(
      "base64"
    )}`;
    try {
      const user = await User.findById(userId);
      if (user) {
        const id = user.profile.id;
        await cloudinary.uploader.destroy(id);

        const result = await cloudinary.uploader.upload(dataUri, {
          public_id: crypto.randomBytes(16, (err, buf) => {
            if (err) {
              return reject(err);
            } else {
              return (
                buf.toString("hex") +
                "+" +
                String(file.name).split(".")[0] +
                "+" +
                Date.now()
              );
            }
          }),
          resource_type: "image",
          folder: "profiles",
        });

        app["profile"] = {
          id: result.public_id,
          url: result.secure_url,
        };
      }
    } catch (err) {
      console.log(err);
    }
  }

  User.findByIdAndUpdate(
    { _id: userId },
    { $set: app },
    { new: true },
    (err, doc) => {
      if (!err) res.send(doc);
      else
        console.log(
          "Error in Updating User Details :" + JSON.stringify(err, undefined, 2)
        );
    }
  );
});

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

module.exports = {
  createUser,
  loginUser,
  updateUser,
  deleteUser,
};
