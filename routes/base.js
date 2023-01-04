'use strict';

const { isLoggedIn } = require('../middleware/secure-routes');
const User = require('../models/User.model');

const router = require('express').Router();

/* GET home page */
router.get('/', (req, res, next) => {
  /*User.findById(req.session.userId).then(user => {
    res.render("index", { user: user });
  });*/
  console.log(req.user);
  res.render('index');
});

router.get('/main', (req, res, next) => {
  res.render('user/main');
});

router.get('/private', isLoggedIn, (req, res, next) => {
  res.render('user/private');
});

module.exports = router;
