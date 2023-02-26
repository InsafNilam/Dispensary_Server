const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const auth = asyncHandler(async (req, res, next) => {
  const bearerHeader = req.headers.authorization;
  let token;

  if (
    typeof bearerHeader !== "undefined" &&
    bearerHeader.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } else {
    res.status(403).json({ msg: "Token is not Valid" });
  }
});

module.exports = auth;
