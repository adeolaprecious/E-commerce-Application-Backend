const express = require("express");
const router = express.Router();
const User = require('../models/user.model');
const { authMiddleware } = require("../middlewares/authMiddleware");


const {postRegister, postLogin, getProfile, updateProfile} = require("../controllers/user.controller");

router.post("/register", postRegister);
router.post("/login", postLogin);
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);


module.exports = router;



