const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer")

// Render signup page
exports.getSignup = (req, res) => {
  res.render("signUp");
};

// Handle signup form
exports.postRegister = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const existingCustomer = await User.findOne({ email });
    if (existingCustomer) {
      return res.status(400).send("User already exists. Please login.");
    }
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    const newCustomer= new User({ firstName, lastName, email, password: hashedPassword, });
    await newCustomer.save();

    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'adeolaprecious006@gmail.com',
        pass: 'vbqiabvxiekxphud'
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    let mailOptions = {
      from: 'adeolaprecious006@gmail.com',
      to: [req.body.email,  'adeoladebowale24@gmail.com'],
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9fafb;">
          <h2 style="color: #333;">Hello ${req.body.fullName || "User"}, 👋</h2>
          <p style="font-size: 16px; color: #555;">
            Thank you for signing up! Your account has been created successfully.
          </p>
        </div>
      `
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      }
      else {
        console.log('Email sent: ' + info.response);
      }
    });
    res.redirect('/user/signIn');
    //   }).catch((err) => {
    //     console.error("Error registering customer:", err);
    // });
    // console.log("✅ User registered:", newUser.email);

    // res.redirect("/user/signin");
  } catch (err) {
    console.error("❌ Error registering user:", err);
    res.status(500).send("Server error");
  }
};

// Render signin page
exports.getSignin = (req, res) => {
  res.render("signIn");
};

// Handle signin form
exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send("Invalid email or password");
    }

    // compare password
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(400).send("Invalid email or password");
    }

    console.log("✅ User logged in:", user.email);
    res.send(`Welcome ${user.firstName}! You are logged in.`);
  } catch (err) {
    console.error("❌ Error logging in:", err);
    res.status(500).send("Server error");
  }
};
