const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/', (req, res) => {
  let password = req.body.password;
  if (
    bcrypt.compareSync(
      password,
      '$2a$10$11pvtOIyjeFaK3B64QsFgehapCLR2s/VeUlyDRScOOQ89oGaeENi6'
    )
  ) {
    jwt.sign({ admin: true }, process.env.JWT_SECRET, (err, token) => {
      if (err) {
        res.status(500).json({ err });
      } else {
        res.status(202).json({ token });
      }
    });
  } else {
    res.status(401).json({ msg: 'Invalid password' });
  }
});

module.exports = router;
