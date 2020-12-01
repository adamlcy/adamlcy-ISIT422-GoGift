const mongoose = require('mongoose');
const item = require('./itemModel');

const tag = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  item: [{type: mongoose.Schema.Types.ObjectId, ref: 'Item'}]


}, {"collection":"tag"});
tag.index( { "name": 1 }, { unique: true } );

const Tag = mongoose.model("Tag", tag);
module.exports = Tag;