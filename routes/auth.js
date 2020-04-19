const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

router.post('/', (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  Admin.findOne({ username }).then((user) => {
    if (user === null) {
      return res.status(401).json({ msg: 'Invalid credentials.' });
    }
    if (bcrypt.compareSync(password, user.password)) {
      jwt.sign(
        { admin: true, canViewNames: user.permissions.canViewNames },
        process.env.JWT_SECRET,
        (err, token) => {
          if (err) {
            res.status(500).json({ msg: 'Auth error' });
          } else {
            res.json({ token });
          }
        }
      );
    } else {
      return res.status(401).json({ msg: 'Invalid credentials.' });
    }
  });
});

module.exports = router;
