const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const opts = {
    toJSON: {
       virtuals: true
    }
 };

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
             /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please add a valid email'
        ]
    },
    phone: {
        type: Number,
        required: true,
        maxlength: [10, 'Phone number can not be longer than 10 characters']
    },
    occupation: {
        type: String,
        required: [true, 'Please add an occupation'],
    },
    country:{
        type: String,
        required: [true, 'Please add your country'],
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength : 8
    },
    cpassword: {
        type: String,
        required: [true, 'Please add an email'],
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    tokens:[
        {
            token:{
                type: String,
                required: true
            }
        }
    ]
},opts)

// Password Hashing
userSchema.pre('save', async function(next) {
    if(this.isModified('password')){
        const salt = bcrypt.genSaltSync(10);
        this.password=bcrypt.hashSync(this.password, salt);
        this.cpassword=bcrypt.hashSync(this.cpassword, salt);
    }
    next();
});

// Generating JWT
userSchema.methods.generateAuthToken = async function() {
    try{
        let token = jwt.sign( { _id : this._id }, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat( { token : token});
        await this.save();
        return token;
    }catch(err){
        console.log(err);
    }
}


// Generate and hash password token
userSchema.methods.getResetPasswordToken = function () {
    // Generate Token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set Expire 
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
}


const User = mongoose.model('USER', userSchema);

module.exports = User;