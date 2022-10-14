import SMTPTransport from "nodemailer/lib/smtp-transport";
import nodemailer from "nodemailer";
import { IEmailRecipient } from "../models/email.models";
import { SYSTEM_EMAIL_CREDENTIALS } from "../constants";
import { NOREPLY_EMAIL } from "./../constants/index";
import { getDictionayByLanguage } from "./../utils/localization/index";
import log from "../utils/logs";

export const sendEmailToUser = async (userRecipient: IEmailRecipient) => {
  const { name, email, subject, message, language } = userRecipient;

  let transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: SYSTEM_EMAIL_CREDENTIALS.user,
      pass: SYSTEM_EMAIL_CREDENTIALS.password,
    },
    requireTLS: true,
  });

  return await transporter
    .sendMail({
      from: `"Socialbio" <${NOREPLY_EMAIL}>`, // sender address
      to: `"${name}" <${email}>`, // list of receivers
      subject: subject, // Subject line
      replyTo: email,
      text: message, // plain text body
      html: message,
    })
    .then((emailInfo: SMTPTransport.SentMessageInfo) => {
      log.success(`Email successfuly sent to ${email}`);
      return emailInfo;
    })
    .catch(() => {
      log.error(`Error sending email to user ${email}`);
      return false;
    });
};
