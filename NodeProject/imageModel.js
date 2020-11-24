const mongoose = require('mongoose');

const imageTest = new mongoose.Schema({
  image: {  
    data: Buffer, 
    contentType: String
  }, 
}, {"collection":"imageTest"});

const ImageTest = mongoose.model("ImageTest", imageTest);
module.exports = ImageTest;