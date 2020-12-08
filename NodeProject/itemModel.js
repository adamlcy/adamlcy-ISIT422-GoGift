const mongoose = require('mongoose');
const tag = require('./tagModel');

const item = new mongoose.Schema({
  itemName: {
    type: String,
    required: true,
  },

  vendor: {
    type: String
  },

  price: {
    type: String    
  },

  image: {
    type: String
  },

  url: {
    type: String,
    required: true
  },

  tag: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tag'}]

}, {"collection":"item"});
item.index( { "url": 1 }, { unique: true } );

const Item = mongoose.model("Item", item);
module.exports = Item;