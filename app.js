const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const config = require("./config/config");
const fs = require("fs");
const path = require("path");
const UserController = require("./controller/user.controller");
const CronJob = require('cron').CronJob;
const CronTime = require('cron').CronTime;
const User = require("./models/User.model");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  }
});
// Launch app to the specified port
server.listen(config.port);

require('dotenv').config()


//Start App

const CronJobs = require("./controller/cronjob.controller")
//app.use(cors());
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Methods", "GET,PUT,PATCH,POST,DELETE,OPTIONS");
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
const contractRouter = require("./routes/contract.routes");
const mobileRouter = require("./routes/mobile.routes")
const statisticalRouter = require("./routes/statistical.routes")
const roomchatRouter = require("./routes/chatroom.routes")
const messageRouter = require("./routes/message.routes")


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
app.use("/contract", contractRouter)
app.use("/statistical", statisticalRouter)
app.use("/roomchat", roomchatRouter)
app.use("/message", messageRouter)

app.use("/api/mobile", mobileRouter)
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
//===========CRON JOBS=============

// send a reminder email on the 27th of every month
// cron('0 0 8 27 * ?', () => {
//   CronJobs.remindUpdateElectricAndWater()
// }, {
//   timezone: "Asia/Ho_Chi_Minh"
// });

let remindjob = new CronJob('0 8 27 * *', () => {

  CronJobs.remindUpdateElectricAndWater()
}, null, true, 'Asia/Ho_Chi_Minh');
// let testjob = new CronJob('*/5 * * * * *', () => {
//   CronJobs.test()
// }, null, true, 'Asia/Ho_Chi_Minh');

// setTimeout(function () {
//   job.setTime(new CronTime('*/5 * * * * *'))
//   console.log("Start 5")
//   job.start()
// }, 10000);

// socketIO
let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  //when ceonnect
  console.log("a user connected.");

  //take userId and socketId from user
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    //io.emit("getUsers", users);
  });

  //send and get message
  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    const user = getUser(receiverId);
    if (user) {
      io.to(user.socketId).emit("getMessage", {
        senderId,
        text,
      });
    }
  });

  //when disconnect
  socket.on("disconnect", () => {
    console.log("a user disconnected!");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});
//connect to db
mongoose.connect(
  "mongodb+srv://truong:Khang250904@cluster0.xlqnr.mongodb.net/test1?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false },
  () => console.log("connect to db success")
);

