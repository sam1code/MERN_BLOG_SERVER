const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
const errMiddleware = require("./middleWare/error");
const cors = require("cors");
const postRouter = require("./routes/postRoute");
const commentRouter = require("./routes/commentRoute");
const userRoutes = require("./routes/userRoute");
const fileUpload = require("express-fileupload");

// used only on development time
// const responseTime = require("response-time");
// app.use(responseTime());

//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true,
  })
);

//middleware for error
app.use(errMiddleware);
app.use(cors());

// routs middleware
app.use("/api/post", postRouter);
app.use("/api/comment", commentRouter);
app.use("/api", userRoutes);

module.exports = app;
