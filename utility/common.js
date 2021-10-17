const nodemailer = require("nodemailer");

exports.convertArrImage = (arr) => {
    let arrImage = []
    arr.map((img) => {
        arrImage.push(img.filename)
    })
    return arrImage
}
exports.sendEmail = (to, subject, html) => {

    var transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        service: "gmail",
        auth: {
            user: "truongnguyen30999test@gmail.com",
            pass: "Khang250904",
        },
    });
    var mailOptions = {
        from: "truongnguyen30999test@gmail.com",
        to: to,
        subject: subject,
        html: html
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log("Email sent: " + info.response);
        }
    });
}