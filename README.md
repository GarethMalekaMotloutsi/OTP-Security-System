# OTP Security System

A simple OTP security system built with Node.js and Express.

The system generates a 6-digit OTP, sends it by email, and allows the user to verify the code through the frontend.

## Features

* 6-digit OTP generation
* Email OTP delivery
* OTP expiry
* OTP resend
* Resend limits
* Request limits
* Only the latest OTP can be verified
* OTP can only be used once

## Built With

* Node.js
* Express
* JavaScript
* HTML
* CSS
* Nodemailer
* Brevo SMTP
* Vercel

## Run Locally

```bash
npm install
node server.js
```

Then open:

```text
http://localhost:3000
```

Email settings are stored in a `.env` file and are not included in the repository.

## Live Demo

https://otp-security-system-weld.vercel.app/

## References

* Node.js — https://nodejs.org/
* Express — https://expressjs.com/
* Nodemailer — https://nodemailer.com/
* Brevo — https://www.brevo.com/
* Vercel — https://vercel.com/
