const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const crypto = require("crypto");
const env = require("dotenv").config();
const User = require("../../models/userSchema");
const Order = require("../../models/orderSchema");

// Utility function to generate OTP
function generateOtp() {
    return crypto.randomInt(100000, 1000000).toString();
}

// Render forget password page
const forgetPasswordPage = async (req, res, next) => {
    try {
        res.render("forget-password");
    } catch (error) {
        next(error);
    }
};

// Send OTP via email
const sendVerificationEmail = async (email, otp) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.NODEMAILER_EMAIL,
                pass: process.env.NODEMAILER_PASSWORD
            }
        });

        const mailOptions = {
            from: process.env.NODEMAILER_EMAIL,
            to: email,
            subject: "Your OTP for password reset",
            text: `Your OTP is ${otp}`,
            html: `<b><h4>Your OTP: ${otp}</h4></b>`
        };

        await transporter.sendMail(mailOptions);
        console.log("Email sent to:", email);
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
};

// Hash password securely
const securePassword = async (password) => {
    try {
        return await bcrypt.hash(password, 10);
    } catch (error) {
        throw new Error("Error hashing password");
    }
};

// Validate email for password recovery
const forgetEmailValidation = async (req, res, next) => {
    try {
        const { email } = req.body;
        const findUser = await User.findOne({ email });
        
        if (findUser) {
            const otp = generateOtp();
            const emailSent = await sendVerificationEmail(email, otp);
            if (emailSent) {
                req.session.userOtp = otp;
                req.session.email = email;
                console.log("OTP generated and sent:", otp);
                return res.render("forgetPass-otp");
            }
            return res.json({ success: false, message: "Failed to send OTP. Please try again." });
        } else {
            return res.render("forget-password", {
                message: "User with this email does not exist."
            });
        }
    } catch (error) {
        next(error);
    }
};

// Verify the OTP entered by the user
const verifyForgetPassOtp = async (req, res, next) => {
    try {
        const enteredOtp = req.body.otp;
        if (enteredOtp === req.session.userOtp) {
            return res.json({ success: true, redirectUrl: "/reset-password" });
        }
        return res.json({ success: false, message: "OTP not matching." });
    } catch (error) {
        next(error);
    }
};

// Render reset password page
const getResetPassPage = async (req, res, next) => {
    try {
        res.render("reset-password");
    } catch (error) {
        next(error);
    }
};

// Resend OTP to the user
const resendOtp = async (req, res, next) => {
    try {
        const otp = generateOtp();
        req.session.userOtp = otp;
        const email = req.session.email;
        
        console.log("Resending OTP to email:", email);
        const emailSent = await sendVerificationEmail(email, otp);
        
        if (emailSent) {
            console.log("Resend OTP:", otp);
            return res.status(200).json({ success: true, message: "Resend OTP successful." });
        }
    } catch (error) {
        next(error);
    }
};

// Update user's password
const postNewPassword = async (req, res, next) => {
    try {
        const { newPass1, newPass2 } = req.body;
        const email = req.session.email;

        if (newPass1 === newPass2) {
            const passwordHash = await securePassword(newPass1);
            await User.updateOne({ email }, { $set: { password: passwordHash } });
            return res.redirect("/login");
        } else {
            return res.render("reset-password", { message: "Passwords do not match." });
        }
    } catch (error) {
        next(error);
    }
};

// Display user profile
const userProfile = async (req, res, next) => {
    try {
        const userId = req.session.user || req.user;
        const userData = await User.findById(userId)
            .populate('address')
            .exec();

        const firstAddress = userData.address.length > 0 ? userData.address[0] : null;
        const orders = await Order.find({ user: userId }).exec();

        const pendingOrders = orders.filter(order => order.status === 'Pending');
        const completedOrders = orders.filter(order => order.status === 'Delivered');

        return res.render("user-profile", {
            user: res.locals.user,
            firstAddress,
            pendingCount: pendingOrders.length,
            completedCount: completedOrders.length,
            totalOrders: orders.length
        });
    } catch (error) {
        console.error("Profile page not found:", error);
        next(error);
    }
};

module.exports = {
    userProfile,
    forgetPasswordPage,
    forgetEmailValidation,
    verifyForgetPassOtp,
    getResetPassPage,
    resendOtp,
    postNewPassword,
};
