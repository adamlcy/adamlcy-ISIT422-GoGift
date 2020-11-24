var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');
const UserWithImg = require('../userWithImgModel')

var schema = new Schema({
    email: { type: String, require: true },
    username: { type: String, require: true },
    password: { type: String, require: true },
    creation_dt: { type: Date, require: true },
    gogift: {type: mongoose.Schema.Types.ObjectId, ref:'UserWithImg', require: false},

}, {"collection":"userCredentials"});


schema.statics.hashPassword = function hashPassword(password) {
    return bcrypt.hashSync(password, 10);
}

schema.methods.isValid = function (hashedpassword) {
    return bcrypt.compareSync(hashedpassword, this.password);
}


module.exports = mongoose.model('users', schema);