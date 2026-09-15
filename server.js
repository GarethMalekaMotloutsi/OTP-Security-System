require("dotenv").config();
const express = require("express");
const path = require("path");
const generateOtp = require("./otp");
const config = require("./config");
const otpStore = require("./otpStore");
const sendOtpEmail = require("./email");

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static("public"));

app.post("/api/otp/send", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            message: "Email is required"
        });
    }

    const now = Date.now();

const userOtps = otpStore.filter(item => item.email === email);
const existingOtp = userOtps[userOtps.length - 1];

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

try {
    await sendOtpEmail(email, existingOtp.otp);

    return res.json({
        message: "OTP resent",
        email: email
    });
} catch (error) {
    console.log("Email error:", error.message);

    return res.status(500).json({
        message: "Failed to resend OTP email"
    });
}
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

try {
    await sendOtpEmail(email, otp);

    res.json({
        message: "OTP sent successfully",
        email: email
    });

    } catch (error) {
        console.log("Email error:", error.message);

        res.status(500).json({
            message: "Failed to send OTP email"
        });
    }
});

app.post("/api/otp/verify", (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({
            message: "Email and OTP are required"
        });
    }

    const userOtps = otpStore.filter(item => item.email === email);
    const existingOtp = userOtps[userOtps.length - 1];

    if (!existingOtp) {
        return res.status(404).json({
            message: "No OTP found"
        });
    }

    if (existingOtp.used) {
        return res.status(400).json({
            message: "OTP has already been used"
        });
    }

    if (Date.now() > existingOtp.expiresAt) {
        return res.status(400).json({
            message: "OTP has expired"
        });
    }

    if (existingOtp.otp !== otp) {
        return res.status(400).json({
            message: "Invalid OTP"
        });
    }

    existingOtp.used = true;

    return res.json({
        message: "OTP verified successfully"
    });
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});