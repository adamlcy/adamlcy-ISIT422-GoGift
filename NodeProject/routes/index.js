const express = require('express')
const passport = require('passport')
const router = express.Router()
//const { ensureAuth, ensureGuest } = require('../middleware/auth')


// @desc    Login/Landing page
// @route   GET /


/* 
 router.get('/login', /* ensureGuest , *///(req, res) => {
 // res.render('login', {

  //})
//}) 

// @desc    Dashboard
// @route   GET /dashboard
//router.get('/dashboard', /*ensureAuth ,*/ async (req, res) => {
//res.render('dashboard')

    /*   try {
    const friends = await friend.find({ user: req.user.id }).lean()
    res.render('dashboard', {
      name: req.user.firstName,
      friends,
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
   } */
//})

module.exports = router