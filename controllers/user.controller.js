const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer")
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");

// Render signup page
exports.getSignup = (req, res) => {
  res.render("signUp");
};

// Handle signup form
exports.postRegister = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const existingCustomer = await userModel.findOne({ email });
    if (existingCustomer) {
      return res.status(400).send("User already exists. Please login.");
    }
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    const newCustomer = new userModel({ firstName, lastName, email, password: hashedPassword, });
    await newCustomer.save();

    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL.USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    let mailOptions = {
      from: 'adeolaprecious006@gmail.com',
      to: [req.body.email, 'adeoladebowale24@gmail.com'],
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
        console.log(error);
      }
      else {
        console.log('Email sent: ' + info.response);
      }
    });
    res.redirect('/user/signIn');
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
// exports.postLogin = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // find user
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).send("Invalid email or password");
//     }

//     // compare password
//     const isMatch = bcrypt.compareSync(password, user.password);
//     if (!isMatch) {
//       return res.status(400).send("Invalid email or password");
//     }

//     console.log("✅ User logged in:", user.email);
//     res.send(`Welcome ${user.firstName}! You are logged in.`);
//   } catch (err) {
//     console.error("❌ Error logging in:", err);
//     res.status(500).send("Server error");
//   }
// };

exports.postLogin = (req, res) => {
  const { email, password } = req.body;
  // res.send('confirmed again')
  console.log("Login form submitted data", req.body);

  userModel.findOne({ email })
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
      console.log("Login successfull for:", foundCustomer.email);
      // const token = jwt.sign({ email: req.body.email }, "secretkey", { expiresIn: "7d" });
      const token = jwt.sign({ email: req.body.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
      console.log("Generated JWT:", token);

      return res.json({
        message: "Login successful",
        user: {
          id: foundCustomer._id,
          fullName: foundCustomer.fullName,
          email: foundCustomer.email,
          token: token
        }
      })

    })
    .catch((err) => {
      console.error("Error logging in:", err);
      res.status(500).json({ message: "Internal server error" })
    });
};

exports.getDashboard = (req, res) => {
  let token = req.headers.authorization.split(" ")[1]
  // jwt.verify( token, "secretkey", (err, result) => {
  jwt.verify(token, process.env.JWT_SECRET, (err, result) => {
    if (err) {
      console.log(err);
      res.send({ status: false, message: "Token is expired or invalid" })
    } else {
      console.log(result);
      let email = result.email
      userModel.findOne({ email: email })
        .then((foundCustomer) => {
          res.send({ status: true, message: "token is valid", foundCustomer })
        })


    }
  });
}