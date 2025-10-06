const express = require("express");
const router = express.Router();

const { getSignup, postRegister, getSignin, postLogin} = require("../controllers/user.controller");

// signup
router.get("/signup", getSignup);
router.post("/register", postRegister);

// signin
router.get("/signin", getSignin);
router.post("/login", postLogin);

module.exports = router;