const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required, can\'t proceed without it'],
        unique: true,
        // trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        validate: [validator.isEmail, 'Please provide a valid email'],
        // unique: true,
        lowercase: true
    },
    photo: {
        type: String,
        default: 'default.jpg',
        // required: [true, 'Image is required']
    },
    role: {
        type:String,
        enum:['user','guide','lead-guide','admin'],
        default:'user'
    }
    ,
    password: {
        type: String,  // Changed from Number to String
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long'],  // lowercase minlength
        maxlength: [15, 'Password must be at most 10 characters long'], // lowercase maxlength
        select:false
    },
    passwordConfirmation: {
        type: String,  // Changed from Number to String
        required: [true, 'Password confirmation is required'],
        validate: {
            // this only works on save and create
            validator: function(value) {
             
                return value === this.password;
            },
            message: 'Passwords do not match'
        }
    },
    active:{
        type:Boolean,
        default:true,
        select: false
    },
    passwordChangedAt: Date,
    passwordResetToken:String,
    passwordResetExpiresAt: Date
});

UserSchema.pre('save',async function(next){
    if(!this.isModified('password') || this.isNew ) return next();
   
    console.log('hellow'); 
     this.passwordChangedAt = Date.now() - 1000;
         next();
})

UserSchema.pre(/^find/, function(next){
    //this points to the current query

    this.find({active:{$ne:false}});

    next();
})

UserSchema.pre('save',async function(next){

    //ONLY RUN THIS IF THE PASSWORD IS ACTUALLY MODIFIED or is new

    if( !this.isModified('password') ) return next();

    //HASH THE PASSWORD USING bcrypt with the cost of 12
    this.password = await bcrypt.hash(this.password,12);

    this.passwordConfirmation = undefined;  // Remove passwordConfirmation field after hashing it
    next();
})


UserSchema.methods.correctPassword = async function(candidatePassword,userPassword){
    // console.log(candidatePassword);
    // console.log(userPassword);
    return await bcrypt.compare(candidatePassword,userPassword);
    
}

UserSchema.methods.changedPassword = function(JWTTimeStamp){
    if(this.passwordChangedAt){
        
        // changed password field
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000,10);

        // console.log(changedTimestamp,JWTTimeStamp);
        return JWTTimeStamp < changedTimestamp 
    }

    return false;
}

UserSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');
    //this token is what we gonna send it to the user like a reset password it shouldn't be get stored in the database.otherwise if hacker attacks it will gain the access to the reset password token and will change the password
    
    // this ecrypted one will be stored in the database
    this.passwordResetToken =  crypto
                                    .createHash('sha256')
                                    .update(resetToken)
                                    .digest('hex');

    console.log({resetToken},this.passwordResetToken);
    this.passwordResetExpiresAt = Date.now() + 10 * 60 * 1000
    
    return resetToken;
}

const User = mongoose.model('User', UserSchema);

module.exports = User;
