const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const config = require("./config/config");
const fs = require("fs");
const path = require("path");
const UserController = require("./controller/user.controller");
//Start App
const User = require("./models/User.model");
const app = express();
//app.use(cors());
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Methods", "GET,PATCH,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});
//kiểm tra loi file
app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});
//import router
const userRouter = require("./routes/user.routes.js");
const roomRouter = require("./routes/room.routes.js");
const houseRouter = require("./routes/house.routes.js");
const authRouter = require("./routes/auth.routes.js");
const customerRouter = require("./routes/customer.routes.js");
const utilityBillRouter = require("./routes/utilitybills.routes.js");
const serviceRouter = require("./routes/services.routes.js");
const billRouter = require("./routes/bill.routes");
const registerRouter = require("./routes/register.routes");
app.use("/uploads/images", express.static(path.join("uploads", "images")));
app.use("/user", userRouter);
app.use("/room", roomRouter);
app.use("/house", houseRouter);
app.use("/auth", authRouter);
app.use("/customer", customerRouter);
app.use("/utilitybills", utilityBillRouter);
app.use("/service", serviceRouter);
app.use("/bill", billRouter);
app.use("/register", registerRouter);
//routes

app.use("/verify", async (req, res) => {
  try {
    const checkuser = await User.findOne({
      Email: req.query.email,
      ActiveCode: req.query.activeId,
    });
    if (checkuser) {
      checkuser.Status = 1;
      await checkuser.save();
      UserController.initService(checkuser["_id"]);
      return res.redirect(config.frontend_domain + "/verify");
    } else {
      res.json("Fail verify!");
    }
  } catch (error) {
    res.json({ message: error.message });
  }
});
app.get("/", (req, res) => {
  res.send("we are on home");
});
//connect to db

mongoose.connect(
  "mongodb+srv://truong:Khang250904@cluster0.xlqnr.mongodb.net/test1?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => console.log("connect to db success")
);
// Launch app to the specified port
app.listen(config.port);
