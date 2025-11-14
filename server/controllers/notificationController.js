import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// -------------------------------------------------------------
// ✅ Initialize Gmail SMTP transporter (only once)
// -------------------------------------------------------------
let transporter = null;

const initTransporter = () => {
  if (transporter) return transporter; // reuse if already created

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,     // Gmail address
      pass: process.env.EMAIL_PASS,     // Google App Password
    },
  });

  return transporter;
};

// -------------------------------------------------------------
// ✅ sendEmail() - Unified function
// -------------------------------------------------------------
export const sendEmail = async ({ to, subject, text, html }) => {
  const t = initTransporter();

  if (!t) {
    console.log("⚠️ Transporter not configured. Logging email only:");
    console.log({ to, subject, text, html });
    return;
  }

  try {
    const info = await t.sendMail({
      from: `"SchedulEase" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html: html || `<p>${text}</p>`,
    });

    console.log(`✅ Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error("❌ Email send error:", err.message);
    throw new Error("Failed to send email");
  }
};

// -------------------------------------------------------------
// ✅ Optional API handler (manual test route)
// -------------------------------------------------------------
export const sendEmailAPI = async (req, res) => {
  const { to, subject, text } = req.body;

  try {
    await sendEmail({ to, subject, text });
    res.status(200).json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
