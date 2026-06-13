const {onRequest} = require("firebase-functions/https");
const logger = require("firebase-functions/logger");
const nodemailer = require('nodemailer');
const { defineSecret } = require('firebase-functions/params');
const cors = require('cors');

const corsHandler = cors({
  origin: 'https://hstars-2025.web.app',
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Requested-With'],
  maxAge: 3600
});

// const MAIL_USER = defineSecret('GMAIL_USER');
// const MAIL_APP_PASSWORD = defineSecret('GMAIL_APP_PASSWORD');
const MAIL_USER = defineSecret('ZOHO_NOREPLY_MAIL_USER');
const MAIL_APP_PASSWORD = defineSecret('ZOHO_NOREPLY_MAIL_APP_PASSWORD');


exports.sendEmail = onRequest({ secrets: [MAIL_USER, MAIL_APP_PASSWORD] }, (request, response) => {
  
  corsHandler(request, response, () => {
    logger.info("start sendEmail function", {structuredData: true});

    if (request.method !== "POST") return response.status(405).send("Method Not Allowed");

    // The site posts JSON; onRequest usually parses it, but fall back to manual parse for raw string bodies.
    let body = request.body || {};
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return response.status(400).send("Invalid request body");
      }
    }

    const user = MAIL_USER.value();
    const pass = MAIL_APP_PASSWORD.value();

    // const transporter = nodemailer.createTransport({
    //   service: 'gmail',
    //   auth: {
    //     user: user, // your sender email address
    //     pass: pass
    //   }
    // });

    // 587 + STARTTLS => secure:false, requireTLS:true
    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: { user: user, pass: pass },
    });

    const mailOptions = {
      from: user,
      to: 'hammam.najem@clinicwell.app',  // your receiver email address
      subject: body.subject,
      text: `Email: ${body.email}\n\nName: ${body.name}\n\nMessage: ${body.message}`
    };
    
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        logger.error("Error sending email", error);
        return response.status(500).send("Error sending email");
      }

      logger.info("Email sent: " + info.response);
      return response.send("OK");
    });
  });
});