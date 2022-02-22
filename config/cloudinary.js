require("dotenv").config({ path: "./config.env" });

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dtge4ftyt",
  api_key: "518717485326524",
  api_secret: "4Uo_91qBtwtmn1FT3lfvv20c9Mc",
  secure: true,
});

module.exports = cloudinary;
