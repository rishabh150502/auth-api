const mongoose=require('mongoose');

const Schema = mongoose.Schema;

const forgotSchema = new Schema({
    email: {type:String, required:true, unique:true, trim:true},
    verified: {type:Boolean, default:false},
    createdAt: {type:Date, default:Date.now, index:{expires:300}}
},{
    timestamps:true,
});

const forgotPass=mongoose.model('forgot-pass',forgotSchema);

module.exports = forgotPass;