const express = require("express");
const path = require("path");
const generateOtp = require("./otp");
const config = require("./config");
const otpStore = require("./otpStore");

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static("public"));

app.post("/api/otp/send", (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            message: "Email is required"
        });
    }

    const now = Date.now();

    const existingOtp = otpStore.find(item => item.email === email);

const requestTimes = otpStore
    .filter(item => item.email === email)
    .flatMap(item => item.requestTimes || [])
    .filter(time => now - time < 60 * 60 * 1000);

if (requestTimes.length >= config.maxRequestsPerHour) {
    return res.status(429).json({
        message: "Maximum OTP requests reached"
    });
}

if (existingOtp && now - existingOtp.createdAt < config.resendWindow * 60 * 1000) {
    if (existingOtp.resendCount >= config.maxResends) {
        return res.status(429).json({
            message: "Maximum resend limit reached"
        });
    }

    existingOtp.expiresAt = now + config.otpExpiry * 1000;
    existingOtp.resendCount += 1;
    existingOtp.requestTimes.push(now);

    return res.json({
        message: "OTP resent",
        email: email
    });
}


let otp = generateOtp();

while (
    otpStore.some(
        item =>
            item.email === email &&
            now - item.createdAt < 24 * 60 * 60 * 1000 &&
            item.otp === otp
    )
) {
    otp = generateOtp();
}

const newOtp = {
    email: email,
    otp: otp,
    createdAt: now,
    expiresAt: now + config.otpExpiry * 1000,
    resendCount: 0,
    used: false,
    requestTimes: [now]
};

otpStore.push(newOtp);

    res.json({
        message: "OTP request received",
        email: email
    });
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});