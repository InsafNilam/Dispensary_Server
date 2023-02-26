require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");

const app = express();

const connection = require("./Config/DB");

//import routers by creating constant variables
const userRouter = require("./Routes/userRoutes");

// database connection
connection();

// middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  fileUpload({ useTempFiles: true, limits: { fileSize: 50 * 2024 * 1024 } })
);
app.use(cors());

const port = process.env.PORT || 8000;

// routes
app.use("/api/user", userRouter);

app.listen(port, (err) => {
  if (err) console.log("Error ocuured in starting the server:", err);
  console.log(`DevX Server is listening on port ${port}...`);
});
