 const mongoose = require('mongoose');
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


  tag: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tag'}],

  wishlist: [{type: mongoose.Schema.Types.ObjectId, ref: 'Item'}],

  friend: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
 
}, {"collection":"user"});


module.exports = mongoose.model('User', schema);


const User = mongoose.model("User", user);
module.exports = User;


 