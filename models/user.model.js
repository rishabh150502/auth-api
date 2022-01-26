const mongoose=require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    first: {type:String, required:true},
    last: {type:String, required:true},
    email: {type:String, required:true, unique:true, trim:true},
    password: {type:String, required:true, minlength:6},
},{
    timestamps:true,
});

const User=mongoose.model('User',userSchema);

module.exports = User;