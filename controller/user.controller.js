const User = require("../models/User.model");
const Service = require("../models/Services.model");
const crypto = require("crypto");
const fs = require("fs");
const nodemailer = require("nodemailer");
const config = require("../config/config");
const common = require("../utility/common");


exports.createUser = async (req, res, next) => {
  let salt = crypto.randomBytes(16).toString("base64");
  let hash = crypto
    .createHmac("sha512", salt)
    .update(req.body.PassWord)
    .digest("base64");
  req.body.PassWord = salt + "$" + hash;
  req.body.Type = 1;

  try {
    const user = new User({
      Name: req.body.Name,
      Image: req.file.path,
      Age: req.body.Age,
      Email: req.body.Email,
      Phone: req.body.Phone,
      PassWord: req.body.PassWord,
      Type: req.body.Type,
      Status: 1,
    });
    const result = await user.save();
    this.initService(result["_id"]);
    res.json(result);
  } catch (err) {
    res.json({ message: err.message });
    const error = new HttpError(
      "Signing up failed, please try again later.",
      500
    );
    return next(error);
  }
};
exports.register = async (req, res) => {
  try {
    const user = await User.findOne({ Email: req.body.Email });
    if (user) {
      res.json({ message: "Email already exist!" });
    } else {
      let salt = crypto.randomBytes(16).toString("base64");
      let hash = crypto
        .createHmac("sha512", salt)
        .update(req.body.PassWord)
        .digest("base64");
      req.body.PassWord = salt + "$" + hash;
      req.body.Type = 1;
      const user = new User({
        Email: req.body.Email,
        PassWord: req.body.PassWord,
        ActiveCode: getRandomInt(1000, 10000),
        Type: req.body.Type,
        Status: 0,
      });
      var link = config.backend_domain + "/verify/?email=" + user.Email + "&activeId=" + user.ActiveCode;
      let html = "Hello, welcome to Ứng dụng quản lý nhà trọ<br> Please Click on the link to verify your email.<br><a href=" + link + ">Click here to verify</a>"
      common.sendEmail(user.Email, "Verify email register", html)
      const result = await user.save();
      res.json(result);
    }
  } catch (error) {
    res.json({ message: error.message });
  }
};
exports.getAllUser = async (req, res) => {
  try {
    const user = await User.find();
    res.json(user);
  } catch (err) {
    res.json({ message: err });
  }
};
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.jwt.userId);
    res.json(user);
  } catch (err) {
    res.json({ message: err.message });
  }
};
exports.getUserAuth = async (req, res) => {
  try {
    const user = await User.findById(req.jwt.userId);
    res.json({
      Id: user._id,
      Name: user.Name,
      Email: user.Email,
    });
  } catch (err) {
    res.json({ message: err.message });
  }
};
exports.updateUser = async (req, res) => {
  // if (req.body.password) {
  //     let salt = crypto.randomBytes(16).toString('base64');
  //     let hash = crypto.createHmac('sha512', salt).update(req.body.password).digest("base64");
  //     req.body.password = salt + "$" + hash;
  // }
  const user = await User.findById(req.jwt.userId);
  if (user.Image && req.file) {
    fs.unlink(user.Image, (err) => {
      console.log(err.message);
    });
  }

  if (req.file) {
    req.body.Image = req.file.path;
  }
  let update = req.body;
  try {
    const updatedUser = await User.updateOne(
      { _id: req.jwt.userId },
      { $set: update }
    );
    res.json(updatedUser);
  } catch (err) {
    res.json({ message: err });
  }
};
exports.deleteUser = async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (user.Image === "") {
    fs.unlink(user.Image, (err) => {
      console.log(err);
    });
  }
  try {
    const removeUser = await User.remove({ _id: req.params.userId });
    res.json(removeUser);
  } catch (err) {
    res.json({ message: err });
  }
};
exports.initService = async (userId) => {
  const service1 = new Service({
    ServiceName: "Điện",
    Description: "Tiền điện",
    Price: 3000,
    UserId: userId,
  });
  const service2 = new Service({
    ServiceName: "Nước",
    Description: "Tiền Nước",
    Price: 10000,
    UserId: userId,
  });
  const service3 = new Service({
    ServiceName: "Rác",
    Description: "Tiền rác hàng tháng",
    Price: 3000,
    UserId: userId,
  });
  await service1.save();
  await service2.save();
  await service3.save();
};
exports.changePassWord = async (req, res) => {
  try {
    const user = await User.findById(req.jwt.userId);
    let passwordFields = user.PassWord.split("$");
    let salt = passwordFields[0];
    let hash = crypto
      .createHmac("sha512", salt)
      .update(String(req.body.currentPassWord))
      .digest("base64");
    if (hash === passwordFields[1]) {
      salt = crypto.randomBytes(16).toString("base64");
      hash = crypto
        .createHmac("sha512", salt)
        .update(req.body.newPassWord)
        .digest("base64");
      req.body.newPassWord = salt + "$" + hash;
      user.PassWord = req.body.newPassWord;
      const result = await user.save();
      res.json(result);
    } else {
      return res.json({ err: "Vui lòng nhập lại mật khẩu" });
    }
  } catch (err) {
    res.json({ err: err.message });
  }
};
const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min;
};
