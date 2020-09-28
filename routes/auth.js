const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
router.post('/', (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  db.query(
    `SELECT * FROM teachers WHERE username='${username}'`,
    (err, data) => {
      if (data.rows.length === 0 || err) {
        return res.status(401).json({ msg: 'Invalid credentials.' });
      } else if (bcrypt.compareSync(password, data.rows[0].password)) {
        jwt.sign(data.rows[0], process.env.JWT_SECRET, (err, token) => {
          if (err) {
            return res.status(500).json({ msg: 'Authentication error' });
          } else {
            res.json({ token });
          }
        });
      }
    }
  );
});
const isTeacher = async (teacher_id) => {
  db.query(
    `SELECT * FROM teachers WHERE teacher_id='${teacher_id}'`,
    (err, res) => {
      if (err) return false;
      else if (res.rows.length === 1) return true;
      else return false;
    }
  );
};
module.exports = isTeacher;

module.exports = router;
