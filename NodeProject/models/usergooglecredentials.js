const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//var bcrypt = require('bcrypt');
const UserWithImg = require('../userWithImgModel')

const schemaGoogle = new Schema({
/*     googleId:{
        type: String,
        required:true
    }, */ 

    email:{
        type: String,
        required:true
    },

/*     displayName:{
        type: String,
        required:true
    }, */

/*     firstName:{
        type: String,
        required:true
    }, */

    username:{
        type: String,
        required:false
    },

    image:{
        type: String,
        //required:true
    },
    createAt:{
        type: Date,
        default: Date.now
    },

    // gogift created to link credentials with user collection
    // can redirect logged in user to appropriate page
    // require is false so we can set the initial value as null
    gogift: {type: mongoose.Schema.Types.ObjectId, ref:'UserWithImg', require: false},

}, {"collection":"userGoogleCredentials"});



module.exports = mongoose.model('userGoogleCredentials', schemaGoogle);