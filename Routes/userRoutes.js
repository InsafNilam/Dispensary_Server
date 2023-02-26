const express = require("express");
const auth = require("../Middleware/auth");

const router = express.Router();
const {
  createUser,
  loginUser,
  deleteUser,
  updateUser,
} = require("../Controllers/userController");

router.post("/signup", createUser);
router.post("/signin", loginUser);
router.put("/update", auth, updateUser);
router.delete("/delete", auth, deleteUser);

module.exports = router;
