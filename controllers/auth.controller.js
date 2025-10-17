const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No user found with that email." });
    }

    // 🔑 Generate reset token valid for 1 hour
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secretkey", {
      expiresIn: "1h",
    });

    const resetLink = `http://localhost:5173/reset-password/${token}`;

    // 💌 Send reset link email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "DIVA Password Reset",
      html: `
        <div style="max-width:600px;margin:auto;padding:20px;border-radius:8px;background:#fefefe;">
          <h2 style="color:#FFC107;text-align:center;">Password Reset Request</h2>
          <p>Hello ${user.firstName || "there"},</p>
          <p>You requested to reset your password. Click the button below to proceed:</p>
          <a href="${resetLink}" 
             style="display:inline-block;background:#FFC107;color:#fff;text-decoration:none;
             padding:10px 20px;border-radius:6px;margin:20px auto; text-align:center;">
             Reset Password
          </a>
          <p>This link will expire in <strong>1 hour</strong>.</p>
          <p>If you didn’t request this, just ignore this email.</p>
          <br/>
          <p>— The DIVA Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Password reset link has been sent to your email." });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error while sending reset link." });
  }
};

exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password reset successful. You can now log in." });
  } catch (err) {
    console.error("Reset password error:", err);
    if (err.name === "TokenExpiredError") {
      return res.status(400).json({ message: "Reset link expired. Please try again." });
    }
    res.status(400).json({ message: "Invalid or expired reset token." });
  }
};
