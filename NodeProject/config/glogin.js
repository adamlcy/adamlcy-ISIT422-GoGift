const mongoose = require('mongoose')
const User = require('../models/usergooglecredentials')
const { config } = require('dotenv/types')

exports.googleLogin = function (req, res, next){
    // verify the token using google client
    return googleClient
    .verifyIdToken({
        idToken: req.body.token,
        audience: config.google.clientID
    })
    .then(login => {
        //if verification is ok, google return a jwt
        var payload = login.getPayload();
        var userid = payload['sub'];

        //check if the jwt is issued for our client
        var audience = payload.aud;
        if (audience !== config.google.clientID) {
            throw new Error (
                'errpr while authenticate gogle user: audience mistamtch: wanted [' + config.google.clientID + 
                '] but was [' +
                audience +
                ']'
            );
        } 
        // promise the creation of a user
        return {
            name: payload['name'],
            pic
        }
    })
}