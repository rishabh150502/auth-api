const User = require('../models/user.model');
const router = require('express').Router();
const nodemailer = require("nodemailer");
const jwt = require('jsonwebtoken');
const otp = require('../models/otp.model');
const otpGenerator = require('otp-generator');
const bcrypt = require('bcryptjs');

let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth:{
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    }
});



router.route('/signUp').post(async(req,res)=>{
    const{first,last,email,password}=req.body;
    const token = jwt.sign({first,last,email,password},process.env.jwt_key,{expiresIn: '5m'});
    const user=await User.findOne({email});
        if(user){
            return res.status(400).json({err:'User already exists.'})
        }
        let newOtp = otpGenerator.generate(6,{digits:true,lowerCaseAlphabets:false,upperCaseAlphabets:false,specialChars:false});
        let saveOTP = new otp({email,otp:newOtp,token});
        const salt = await bcrypt.genSalt(10);
       saveOTP.otp = await bcrypt.hash(saveOTP.otp, salt);
        const success=await saveOTP.save();
            if(success){
            let mailOptions ={
                from: `"Rishabh Raj" <rishabh8n@gmail.com>`,
                to: `${email}`,
                subject: `Account Verification`,
                text: `OTP is ${newOtp}`
            }
            transporter.sendMail(mailOptions,(err,info)=>{
                if(err){
                    return console.log(err);
                }
                console.log("Message sent: %s", info.messageId);
            })
            res.json({message:'OTP sent successfully'});
        }
});

router.route('/signUp/verify').post(async(req,res)=>{
    
    
    try{
        let checkUser=await User.findOne({email:req.body.email});
        if(checkUser){
            return res.status(400).json({err:'User already verified.'});
        }
    let allOtp = await otp.find({email:req.body.email});
    if (allOtp.length === 0){ return res.status(400).json('Otp expired');}
    const currOtp = allOtp[allOtp.length-1];
    const verifiedUser = await bcrypt.compare(req.body.otp, currOtp.otp);
    if(verifiedUser){
        let user = jwt.verify(currOtp.token,process.env.jwt_key, (err,decode)=>{
            if(err){
                return res.status(400).json({err});
            }
            return decode;
        });
        console.log(user);
        const {first,last,email,password} = user;
            let newUser = new User({first,last,email,password});
            const salt = await bcrypt.genSalt(10);
            newUser.password = await bcrypt.hash(newUser.password, salt);
            let success = await newUser.save();
            const otpDelete = await otp.deleteMany({email: currOtp.email})
        if(success){
            return res.json('Signed Up Successfully');
        }
    }else{
        res.json({err:'Wrong OTP'});
    }
    }catch(err){
        res.json({err:err.message})
    }
});

router.route('/signIn').post(async(req,res)=>{
    const {email,password}=req.body;
    const user = await User.findOne({email});
    if(!user)return res.json({message:'User not found'});

    const success = await bcrypt.compare(password,user.password);
    if(!success){
      return res.json({message:'Incorrect Password'});
    }
    const token = jwt.sign(user.email,process.env.jwt_key);
    res.cookie('auth',token).json({message:'Logged In'});
});

module.exports = router;