const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

// ✅ Register user
exports.postRegister = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'firstName, lastName, email and password are required' });
    }

    const existingCustomer = await User.findOne({ email });
    if (existingCustomer) {
      return res.status(409).json({ message: 'User already exists. Please login.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    const newCustomer = new User({ firstName, lastName, email, password: hashedPassword });
    const savedUser = await newCustomer.save();

    // Send welcome email
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      tls: { rejectUnauthorized: false },
    });

    let mailOptions = {
      from: process.env.EMAIL_USER,
      to: [req.body.email, process.env.EMAIL_USER],
      html: `
      <div style="max-width:600px; margin:0 auto; background:#FAFE0; border-radius:8px;">
        <div style="background:#FFC107; padding:24px; text-align:center; color:#ffffff;">
          <h1>🎉 Welcome to DIVA!</h1>
        </div>
        <div style="padding:24px; color:#333;">
          <h2>Hi ${firstName},</h2>
          <p>Congratulations! Your account has been successfully created with <strong>DIVA</strong>.</p>
          <p>Enjoy exclusive deals and track your orders easily.</p>
          <p>Cheers,<br>DIVA Team</p>
        </div>
      </div>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) console.log('Email error:', error.message);
      else console.log('Email sent: ' + info.response);
    });

    return res.status(201).json({
      message: 'Registration successful. Please log in.',
      user: {
        id: savedUser._id,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        email: savedUser.email
      }
    });

  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).send("Server error");
  }
};

// ✅ Login user
exports.postLogin = (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email })
    .then((foundCustomer) => {
      if (!foundCustomer) return res.status(400).json({ message: "Invalid email or password" });

      const isMatch = bcrypt.compareSync(password, foundCustomer.password);
      if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

      const token = jwt.sign(
        { id: foundCustomer._id, email: foundCustomer.email },
        process.env.JWT_SECRET || 'secretkey',
        { expiresIn: '7d' }
      );

      res.json({
        message: "Login successful",
        user: {
          id: foundCustomer._id,
          firstName: foundCustomer.firstName,
          lastName: foundCustomer.lastName,
          email: foundCustomer.email,
          token
        }
      });
    })
    .catch((err) => {
      console.error("Error logging in:", err);
      res.status(500).json({ message: "Internal server error" });
    });
};

// ✅ Profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, password } = req.body;

    const updateFields = {};
    if (firstName) updateFields.firstName = firstName;
    if (lastName) updateFields.lastName = lastName;
    if (password) updateFields.password = await bcrypt.hash(password, 10);

    const user = await User.findByIdAndUpdate(userId, updateFields, { new: true }).select("-password");
    res.json({ message: "Profile updated successfully", user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
