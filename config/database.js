const mongoose = require("mongoose");
// require("dotenv").config();

const connectDatabase = async () => {
  await mongoose
    .connect(process.env.MONGO_DB_URI)
    .then((data) => console.log(data.connection.host));
};
module.exports = connectDatabase;
