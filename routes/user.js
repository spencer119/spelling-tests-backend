const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Group = require('../models/Group');
const Test = require('../models/Test');
require('dotenv/config');
const db = require('../db');
router.post('/', async (req, res) => {
  db.query(
    `SELECT * FROM students WHERE username='${req.body.username}'`,
    (err, data) => {
      if (err || data.rows.length === 0) {
        res.status(404).json({ msg: 'Invalid name.' });
      } else {
        console.log(data.rows);
        jwt.sign(
          { teacher: false, student: data.rows[0] },
          process.env.JWT_SECRET,
          {},
          (err, token) => {
            if (err) {
              res.status(500).json({ err });
            } else {
              res.status(202).json({ token });
            }
          }
        );
      }
    }
  );
});
router.get('/test', (req, res) => {
  let token = req.headers.token;
  jwt.verify(token, process.env.JWT_SECRET, (err, auth) => {
    if (err) {
      return res.status(401).json({ msg: 'Invalid token.' });
    } else {
      console.log(auth);
      Group.findOne({ name: auth.student.group }).then((group) => {
        if (group.activeTest === '') {
          res
            .status(404)
            .json({ msg: 'There are currently no tests available.' });
        } else {
          Test.findOne({ name: group.activeTest }).then((test) => {
            res.status(200).json({ test, testName: group.activeTest });
          });
        }
      });
    }
  });
});

module.exports = router;
