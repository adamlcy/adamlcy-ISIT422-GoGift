/*  const mongoose = require('mongoose');
const tag = require('./tagModel');
const item = require('./itemModel');
const bcrypt = require('bcrypt') 

const user = new mongoose.Schema({
   firstName: {
    type: String,
  //  required: true,
  },

  lastName: {
    type: String,
    //required: true
  },
  
  bio: {
    type: String
  },

  profileImg: {
    type: String
  }, 

   email: { type: String, require: true },
    username: { type: String, require: true },
    password: { type: String, require: true },
    creation_dt: { type: Date, require: true },

  tag: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tag'}],

  wishlist: [{type: mongoose.Schema.Types.ObjectId, ref: 'Item'}],

  friend: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
 
}, {"collection":"user"});

schema.statics.hashPassword = function hashPassword(password) {
    return bcrypt.hashSync(password, 10);
}

schema.methods.isValid = function (hashedpassword) {
    return bcrypt.compareSync(hashedpassword, this.password);
}

module.exports = mongoose.model('User', schema);

/*
const User = mongoose.model("User", user);
module.exports = User;

 */
 