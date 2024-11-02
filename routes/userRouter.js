const express = require('express');
const router = express.Router();
const userController = require('../controllers/user/userController')

router.get('/home',userController.loadHomepage);
router.get('/login',userController.loadLogin);


// router.get("/login/forget-password",userProfileController.forgetPasswordPage);




module.exports= router;