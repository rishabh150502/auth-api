const User = require('../models/user.model');
const forgotPass = require('../models/forgotPass.model');
const router = require('express').Router();
const nodemailer = require("nodemailer");
const jwt = require('jsonwebtoken');
const otp = require('../models/otp.model');
const cookieParser =require('cookie-parser');
const otpGenerator = require('otp-generator');
const bcrypt = require('bcryptjs');

let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth:{
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    }
});



router.route('/forgotpassword').post(async(req,res)=>{
    const{email}=req.body;
    const user=await User.findOne({email});
        if(!user){
            return res.status(400).json({err:'User does not exists.'})
        }
        const checkforgotPass = await forgotPass.findOne({email});
        if(!checkforgotPass){
        const newforgotPass = new forgotPass({email});
        await newforgotPass.save();
        }
        let newOtp = otpGenerator.generate(6,{digits:true,lowerCaseAlphabets:false,upperCaseAlphabets:false,specialChars:false});
        let saveOTP = new otp({email,otp:newOtp});
        const salt = await bcrypt.genSalt(10);
        saveOTP.otp = await bcrypt.hash(saveOTP.otp, salt);
        saveOTP.save((err,success)=>{
            if(err){
                return res.status(400).json({err});
            }
            let mailOptions ={
                from: `"Rishabh Raj" <rishabh8n@gmail.com>`,
                to: `${email}`,
                subject: `Reset Password`,
                text: `OTP is ${newOtp}`
            }
            transporter.sendMail(mailOptions,(err,info)=>{
                if(err){
                    return console.log(err);
                }
                console.log("Message sent: %s", info.messageId);
            })
            res.json({message:'OTP sent successfully'});
        });
});

router.route('/forgotPassword/verify').post(async(req,res)=>{
    
    
    try{
        let checkUser=await forgotPass.findOne({email:req.body.email});
        console.log(checkUser);
        if(checkUser.verified){
            return res.status(400).json({err:'User already verified.User can change password.'});
        }
    let allOtp = await otp.find({email:req.body.email});
    if (allOtp.length === 0){ return res.status(400).json({err:'Otp expired'});}
    const currOtp = allOtp[allOtp.length-1];
    const verifiedUser = await bcrypt.compare(req.body.otp, currOtp.otp);
    if(verifiedUser){
        console.log('verified');
        checkUser.verified=true;
        const success=await checkUser.save();
            const otpDelete = await otp.deleteMany({email: currOtp.email})
        if(success){
            return res.json({message:'User Verified'});
        }
    }else{
        res.json({err:'Wrong OTP'});
    }
    }catch(err){
        console.log(err);
        res.json({err:err.message})
    }
});

router.route('/changepassword').post(async(req,res)=>{
    const {email,newPassword} = req.body;
    try{
        let checkUser=await forgotPass.findOne({email});
        console.log(checkUser);
        if(checkUser.verified){
            const user =await User.findOne({email});
            if(user){
                user.password=newPassword;
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
                let success = await user.save();
                const otpDelete = await forgotPass.deleteOne({email: checkUser.email});
                if(success){
                    res.json({message:'Password Changed'});
                }
            }
        }
    }catch(err){
        res.json({err:err.message});
    }

});

module.exports = router;
