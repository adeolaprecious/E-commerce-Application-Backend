const express = require ('express');
const router = express.Router();
const customerModel = require('../models/user.model');

const {getSignup, postRegister, getSignin, getDashboard, postLogin} = require ('../controllers/user.controller');


router.get('/signUp',getSignup );

router.post('/register' , postRegister)

router.get ('/signIn' , getSignin)

router.get ('/dashboard' , getDashboard)

router.post ('/login', postLogin)

module.exports = router