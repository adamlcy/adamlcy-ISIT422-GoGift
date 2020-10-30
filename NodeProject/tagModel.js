const mongoose = require('mongoose');
const item = require('./itemModel');

const tag = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  item: [{type: mongoose.Schema.Types.ObjectId, ref: 'Item'}]


}, {"collection":"tag"});

const Tag = mongoose.model("Tag", tag);
module.exports = Tag;