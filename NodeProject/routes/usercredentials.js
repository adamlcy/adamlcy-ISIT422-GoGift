var express = require('express');
var router = express.Router();
var UserC = require('../models/usercredential');
//var User = require('../userModel');
var jwt = require('jsonwebtoken');
const { Mongoose } = require('mongoose');
const { route } = require('..');
const User = require('../userModel');
var UserCG = require('../models/usergooglecredentials');

router.post('/register', function (req, res, next) {
  var userC = new UserC ({
    email: req.body.email,
    username: req.body.username,
    password: UserC.hashPassword(req.body.password),
    creation_dt: Date.now(),
    gogift: null  // field to check whether the user has an account or not
  });

  let promise = userC.save();

  promise.then(function (doc) {
    return res.status(201).json(doc);
  })

  promise.catch(function (err) {
    return res.status(501).json({ message: 'Error registering user.' })
  })
})

// PATCH /credentials/:_id
// Update gogift in credentials.
// Need credential id to update document. (passed in as a req.params)
// Need user id to update gogift with new value (ObjectId in user collection) (passed in through req.body)
router.patch('/credentials/:_id', function (req, res){
  console.log(req.body);
    
  promise =  UserCG.findByIdAndUpdate (req.params._id, {
    gogift: req.body.accountId
  },{new: true}).exec();
  // {new: true} --> mongodb will pass back the updated doc

  promise.then(function (doc){
    if(doc){
      console.log(doc)
    }
    return res.status(200).json({
     gogift: doc.gogift //only pass back the gogift field to check if it's updated
    })  
  })


/*   else {

   promiseGoogle = UserCG.findByIdAndUpdate (req.params._id, {
    gogift: req.body.accountId
  }, {new: true}).exec();

  promise.then(function (doc){
    if(doc){
      console.log(doc)
    }
  })
    return res.status(200).json({
      gogift: doc.gogift
    })
  } */
 

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
        let email = doc.email;

        // Angular needs the following data so we pass it back as a response:
        // token: for verifying the token
        // email: for storing the value in the user collection
        // gogift: checking if user has already created an account or not [null: first-time user/have value: already created account]
        // credId: for updating the doc in the credentials collection (gogift is updated with the ObjectId for the user collection; not null anymore)
        return res.status(200).json( {
            token: token,
            email: email,
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

// google

router.post('/postSocialLogin', (req, res, next) => {
  UserCG.findOne({username: req.body.username}, (err, user)=>{
    if(err){
      next(err);
    }
    if (!user){
      var newUser = new UserCG(req.body);
      newUser.save((err, save) => {
/*         
        let gogift = req.gogiftt;
        let ob_id = req._id;
        let email = req.email

        return res.status(200).json ({
          gogift: gogift,
     //     googleId:ob_id,
          email: email,
          credId: ob_id
        }) */
        if(err){
          next(err);
        }
        else{
          res.send({sucess: true, status: 'User Added Successfully', usergData: newUser});
          console.log(newUser)
        }
      })
    }
    else{
      res.json ({sucess: true, status: 'User Added Successfully', usergData: user });
      console.log(user)
    }
  })
})




module.exports = router;