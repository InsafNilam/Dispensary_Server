const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const connectDB = async () => {
  const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  try {
    mongoose.connect(process.env.DB, connectionParams);
    console.log("Connected to database successfully");
  } catch (error) {
    console.log(error);
    console.log("Could not connect database!");
  }
};

module.exports = connectDB;
