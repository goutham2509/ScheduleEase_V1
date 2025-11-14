import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

export const sendEmail = async (to, subject, html) => {
  console.log("📧 Sending email to:", to);

  try {
    const info = await transporter.sendMail({
      from: `"SchedulEase" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email SENT:", info.messageId);
    return info;
  } catch (err) {
    console.error("❌ EMAIL ERROR:", err);
  }
};
