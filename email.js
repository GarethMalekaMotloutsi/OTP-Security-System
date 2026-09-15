const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

async function sendOtpEmail(email, otp) {
    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP code is ${otp}. It expires in 30 seconds.`
    });
}

module.exports = sendOtpEmail;