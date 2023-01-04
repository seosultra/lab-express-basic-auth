'use strict';

const bcryptjs = require('bcryptjs');
const session = require('express-session');
const mongoose = require('mongoose');
const { isLoggedOut, isLoggedIn } = require('../middleware/secure-routes');
const router = require('express').Router();

const User = require('./../models/User.model');

//* Registration routes:
router.get('/signup', isLoggedOut, (req, res, next) => {
  res.render('auth/signup');
});
/*  Had a hard time get the error handling correct with try..catch 😕
router.post("/signup", isLoggedOut, async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      res.render("auth/signup", { errMessage: "All fields are mandatory!" });
      return;
    }
    const salt = await bcryptjs.genSalt(10);
    const hashedPW = await bcryptjs.hash(password, salt);
    //await User.create({ username, email, hashedPassword: hashedPW });
    res.redirect("/");
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) {
      res.status(500).render("auth/signup", { errMessage: err.message });
    } else {
      next(err);
    }
  }
});
*/
router.post('/signup', isLoggedOut, (req, res, next) => {
  const { username, email, password } = req.body;
  const pwRegEx = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/; //tested with regex plugin✅
  //User have to fill out every input element
  if (!username || !email || !password) {
    res.render('auth/signup', {
      errMessage: 'All fields are mandatory.Please fill them out.'
    });
    return;
  }
  //Force user to choose strong PW
  if (!pwRegEx.test(password)) {
    res.status(500).render('auth/signup', {
      errMessage:
        'Password needs to have at least 6 chars and must contain at least one number, one lowercase and one uppercase letter.'
    });
  }
  bcryptjs.genSalt(10).then((salt) => {
    bcryptjs
      .hash(password, salt)
      .then((hashedPW) => {
        //console.log(hashedPW);
        return User.create({ username, email, hashedPassword: hashedPW });
      })
      .then((user) => {
        req.session.userId = user._id;
        res.redirect('/');
      })
      .catch((err) => {
        //If error is meant to show up to visitor
        if (err instanceof mongoose.Error.ValidationError) {
          console.log(err.message);
          res.status(500).render('auth/signup', { errMessage: err.message });
        } else if (err.code === 11000) {
          res.status(500).render('auth/signup', {
            errMessage:
              'Either username or email is already used. Must be unique.'
          });
        } else {
          // Else passing the error..
          next(err);
        }
      });
  });
});

//* Login routes:
router.get('/login', isLoggedOut, (req, res) => {
  res.render('auth/login');
});

router.post('/login', isLoggedOut, async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      res.render('auth/login', {
        errMessage: 'Username is not registered. Please check spelling'
      });
      return;
    } else if (bcryptjs.compareSync(password, user.hashedPassword)) {
      // save user in session and redirect to Main page??
      //req.session.currentUser = user;
      console.log(req.session.currentUser);
      req.session.userId = user._id;
      res.redirect('/');
    } else {
      res.render('auth/login', {
        errMessage: 'Please provide correct password.'
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});
//Logout handler
router.post('/logout', isLoggedIn, (req, res, next) => {
  req.session.destroy((err) => {
    if (err) next(err);
    res.redirect('/');
  });
});

module.exports = router;
