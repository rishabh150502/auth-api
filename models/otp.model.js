const mongoose=require('mongoose');

const Schema = mongoose.Schema;

const otpSchema = new Schema({
    email: {type:String, required:true, trim:true},
    otp: {type:String,required:true},
    token: String,
    createdAt: {type:Date, default:Date.now, index:{expires:300}}
},{
    timestamps:true,
});

const otp=mongoose.model('OTP',otpSchema);

module.exports = otp;