const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

// Render signup page
// exports.getSignup = (req, res) => {
//   res.render("signup");
// };

// Handle signup form
exports.postRegister = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    // basic validation
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

    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    let mailOptions = {
      from: process.env.EMAIL_USER,
      to: [req.body.email, process.env.EMAIL_USER],
      html: `
  <div style="max-width:600px; margin:0 auto; background:#FAFE0; border-radius:8px; overflow:hidden;">
    <div style="background:#FFC107; padding:24px; text-align:center; color:#ffffff;">
      <h1 style="margin:0; font-size:24px;">🎉 Welcome to DIVA!</h1>
    </div>
    <div style="padding:24px; color:#333;">
      <h2 style="color:#111827; font-size:20px; margin-bottom:12px;">Hi ${firstName},</h2>
      <p style="line-height:1.6; margin-bottom:16px;">Congratulations! 🎊 Your account has been successfully created with <strong>DIVA</strong>.</p>
      <p style="line-height:1.6; margin-bottom:16px;">We’re excited to have you on board. From now on, you’ll be able to enjoy exclusive deals, track your orders, and shop faster than ever.</p>
      <p style="line-height:1.6; margin-bottom:16px;">Cheers,<br>DIVA Team</p>
    </div>
    <div style="padding:16px; font-size:13px; text-align:center; color:#888; background:#f9fafb;">
      &copy; 2025 DIVA. All rights reserved.
    </div>
  </div>
  `
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log('Email error:', error && error.message ? error.message : error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
    // return safe user data (never return password)
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

// Render signin page
// exports.getSignin = (req, res) => {
//   res.render("signin");
// };

exports.postLogin = (req, res) => {
  const { email, password } = req.body;
  // res.send('confirmed again')
  console.log("Login form submitted data", req.body);
  User.findOne({ email })
    .then((foundCustomer) => {
      if (!foundCustomer) {
        console.log("Invalid email");
        return res.status(400).json({ message: "Invalid email or password" })
      }

      const isMatch = bcrypt.compareSync(password, foundCustomer.password);
      if (!isMatch) {
        console.log("Invalid password");
        return res.status(400).json({ message: "Invalid email or password" });
      }
      console.log("Login successful for:", foundCustomer.email);
      const token = jwt.sign({ id: foundCustomer._id, email: foundCustomer.email }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '7d' });
      console.log("Generated JWT for user id:", foundCustomer._id.toString());

      const fullName = `${foundCustomer.firstName || ''} ${foundCustomer.lastName || ''}`.trim();
      return res.json({
        message: "Login successful",
        user: {
          id: foundCustomer._id,
          firstName: foundCustomer.firstName,
          lastName: foundCustomer.lastName,
          fullName: fullName,
          email: foundCustomer.email,
          token: token
        }
      });

    })
    .catch((err) => {
      console.error("Error logging in:", err);
      res.status(500).json({ message: "Internal server error" })
    });
};

exports.getDashboard = (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: false, message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET || 'secretkey', (err, result) => {
    if (err) {
      console.log('JWT verify error:', err.message || err);
      return res.status(401).send({ status: false, message: 'Token is expired or invalid' });
    }
    // result should contain id and email
    const email = result.email;
    User.findOne({ email: email })
      .then((foundCustomer) => {
        res.send({ status: true, message: 'token is valid', foundCustomer });
      })
      .catch((err) => {
        console.error('Error finding user in dashboard:', err);
        res.status(500).send({ status: false, message: 'Server error' });
      });
  });
};