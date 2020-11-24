var express = require('express');
var router = express.Router();
var UserC = require('../models/usercredential');
//var User = require('../userModel');
var jwt = require('jsonwebtoken');
const { Mongoose } = require('mongoose');
const { route } = require('..');

router.post('/register', function (req, res, next) {
  var userC = new UserC ({
    email: req.body.email,
    username: req.body.username,
    password: UserC.hashPassword(req.body.password),
    creation_dt: Date.now(),
    gogift: null

  });

  let promise = userC.save();

  promise.then(function (doc) {
    return res.status(201).json(doc);
  })

  promise.catch(function (err) {
    return res.status(501).json({ message: 'Error registering user.' })
  })
})


router.patch('/credentials/:_id', function (req, res){
  let promise = UserC.findByIdAndUpdate(req.params._id, {
    gogift: req.body
  },{new: true}).exec();

  promise.then(function (doc){
    if(doc){
      console.log(doc)
    }
    return res.status(200).json({
     gogift: doc.gogift
    })  
  })

})

router.post('/login', function (req, res, next) {
  let promise = UserC.findOne({ email: req.body.email }).exec();

  promise.then(function (doc) {
    if (doc) {
      if (doc.isValid(req.body.password)) {
        // generate token
        let token = jwt.sign({ username: doc.username }, 'secret', { expiresIn: '3h' });
        let gogift = doc.gogift;
        let ob_id = doc._id;


        return res.status(200).json( {
            token: token,
            gogift: gogift,
            credId: ob_id
        });

      } else {
        return res.status(501).json({ message: ' Invalid Credentials' });
      }
    }
    else {
      return res.status(501).json({ message: 'User email is not registered.' })
    }
  });

  promise.catch(function (err) {
    return res.status(501).json({ message: 'Some internal error' });
  })
})

router.get('/username', verifyToken, function (req, res, next) {
  return res.status(200).json(decodedToken.username);
})

var decodedToken = '';
function verifyToken(req, res, next) {
  let token = req.query.token;

  jwt.verify(token, 'secret', function (err, tokendata) {
    if (err) {
      return res.status(400).json({ message: ' Unauthorized request' });
    }
    if (tokendata) {
      decodedToken = tokendata;
      next();
    }
  })
}

module.exports = router;