const sendEmail = document.getElementById("sendEmail");
const sendOtp = document.getElementById("sendOtp");
const message = document.getElementById("message");
const notification = document.getElementById("notification");

function showNotification(text) {
    notification.textContent = text;
    notification.classList.add("show");

    setTimeout(() => {
        notification.classList.remove("show");
    }, 3000);
}

sendOtp.addEventListener("click", async () => {
    const email = sendEmail.value.trim();

    if (!email) {
        message.textContent = "Please enter your email address.";
        return;
    }

    try {
        const response = await fetch("/api/otp/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: email })
        });

        const data = await response.json();

        message.textContent = data.message;
    showNotification(data.message);
    } catch (error) {
        message.textContent = "Something went wrong.";
    }
});

const resendOtp = document.getElementById("resendOtp");

resendOtp.addEventListener("click", async () => {
    const email = sendEmail.value.trim();

    if (!email) {
        message.textContent = "Please enter your email address.";
        return;
    }

    try {
        const response = await fetch("/api/otp/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: email })
        });

         const data = await response.json();

         message.textContent = data.message;
         showNotification(data.message);

    } 
    catch (error) {
        message.textContent = "Something went wrong.";
    }
});


const verifyEmail = document.getElementById("verifyEmail");
const otp = document.getElementById("otp");
const verifyOtp = document.getElementById("verifyOtp");


verifyOtp.addEventListener("click", async () => {
    const email = verifyEmail.value.trim();
    const code = otp.value.trim();

    if (!email || !code) {
        message.textContent = "Please enter your email and OTP.";
        return;
    }

    try {
        const response = await fetch("/api/otp/verify", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                otp: code
            })
        });

         const data = await response.json();

         message.textContent = data.message;
         showNotification(data.message);

    } 
        catch (error) {
        message.textContent = "Something went wrong.";
    }
});