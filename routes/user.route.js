const express = require("express");
const router = express.Router();
const User = require('../models/user.model');

const {postRegister, postLogin} = require("../controllers/user.controller");

router.post("/register", postRegister);
router.post("/login", postLogin);


module.exports = router;