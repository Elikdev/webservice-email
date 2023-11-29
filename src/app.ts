require("dotenv").config();
import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import bodyParser from "body-parser";
import bodyParserXML from "express-xml-bodyparser";
import xmlParser from "body-parser-xml";
import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import dotenv from "dotenv";

const app = express();

dotenv.config();

const morganFormat =
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"';
app.use(morgan(morganFormat));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.use(helmet());

// Use body-parser-xml middleware for XML requests
xmlParser(bodyParser);
app.use(bodyParser.xml());

app.get("/", (req: Request, res: Response) => {
  return res.status(200).json({
    status: "Successful",
    message: "Welcome to web-services-email v1.0 - JSON format",
  });
});

app.get("/xml", (req: Request, res: Response) => {
  res.set("Content-Type", "application/xml");
  return res.status(200).send(`
 <status>Successful</status>
 <message>Welcome to web-services-email v1.0 - XML format</message>
 `);
});

const {
  EMAIL_SERVICE,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASSWORD,
  EMAIL_FROM,
} = process.env;

let transporter = nodemailer.createTransport({
  service: EMAIL_SERVICE,
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: true,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
} as SMTPTransport.Options);

app.post("/send-email-xml", async (req: Request, res: Response) => {
  const { to, subject, text } = req.body.root;

  if (!to || !subject || !text) {
    return res.status(400).send(`
    <status>Failed</status>
    <message>Invalid request parameters</message>
    `);
  }

  const mailOptions = {
    from: EMAIL_FROM,
    to: to[0],
    subject: subject[0],
    text: text[0],
  };
  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).send(`
 <status>Successful</status>
 <message>Email sent successfully</message>
 `);
  } catch (error) {
    console.log(error);
    return res.status(500).send(`
 <status>Failed</status>
 <message>Internal server error</message>
 `);
  }
});

app.post("/send-email-json", async (req: Request, res: Response) => {
  const { to, subject, text } = req.body;

  if (!to || !subject || !text) {
    return res.status(400).json({
      status: "Failed",
      message: "Invalid request parameters",
    });
  }

  const mailOptions = {
    from: EMAIL_FROM,
    to,
    subject,
    text,
  };
  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({
      status: "Successful",
      message: "Email sent successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "Failed",
      message: "Internal server error",
    });
  }
});

app.use('*', (req, res) => {
 return res.status(200).json({
  status: "Failed",
  message: "Route not found - JSON format",
});
});

export default app;
