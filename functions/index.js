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

const GMAIL_USER = defineSecret('GMAIL_USER');
const GMAIL_APP_PASSWORD = defineSecret('GMAIL_APP_PASSWORD');


exports.sendEmail = onRequest({ secrets: [GMAIL_USER, GMAIL_APP_PASSWORD] }, (request, response) => {
  
  corsHandler(request, response, () => {
    logger.info("start sendEmail function", {structuredData: true});

    // Feching request body parameters from the URL-encoded form submission
    if (request.method !== "POST") return response.status(405).send("Method Not Allowed");
    
    // Replace these with your email service credentials
    const user = GMAIL_USER.value();
    const pass = GMAIL_APP_PASSWORD.value();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: user,
        pass: pass
      }
    });

    const mailOptions = {
      from: GMAIL_USER,
      to: request.body.email,
      subject: request.body.subject,
      text: `From ${request.body.name}\n\n${request.body.message}`
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