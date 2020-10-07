const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
router.post('/teacher', (req, res) => {
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
          }
          else if (password === 'eagles2020') {
            res.json({firstLogin: true, token})
          } else {
            res.json({ token });
          }
        });
      } else {
        return res.status(401).json({msg: 'Invalid credentials.'})
      }
    }
  );
});
router.post('/teacher/change/password', (req, res) => {
  let token = req.headers.token;
  jwt.verify(token, process.env.JWT_SECRET, async (err, auth) => {
    if (err) {
      return res.status(403);
    }
    if (auth.teacher_id) {
      let newHash = bcrypt.hashSync(req.body.password);
      console.log(`${req.body.password} : ${newHash}`)
      db.query(
        `UPDATE teachers SET password = '${newHash}' WHERE teacher_id = '${auth.teacher_id}'`,
        (err, data) => {
          if (err) {
            console.log(err);
            res.status(500).json({ err });
          } else {
            res.status(200).json(data);
          }
        }
      );
    } else {
      return res.status(403).json({ msg: 'Unauthorized' });
    }
  });
});
router.post('/student', (req, res) => {
  let username = req.body.username;
  db.query(
    `SELECT student_id, first_name, last_name, username, class_id, teacher_id, group_id FROM students WHERE username = '${req.body.username}'`,
    (err, data) => {
      if (data.rows.length === 0 || err) {
        return res.status(401).json({ msg: 'Invalid username' });
      } else {
        jwt.sign(data.rows[0], process.env.JWT_SECRET, (err, token) => {
          if (err) {
            return res.status(500).json({ msg: 'Authentication error' });
          } else {
            res.json({ token, test_id: '1' });
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
