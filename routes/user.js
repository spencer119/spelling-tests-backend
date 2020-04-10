const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Group = require('../models/Group');
const Test = require('../models/Test');
require('dotenv/config');

router.post('/', async (req, res) => {
  console.log(`${req.body.name} has started the test`);
  let name = req.body.name;
  Student.findOne({ name })
    .then((student) => {
      if (student === null) {
        res.status(404).json({ msg: 'Invalid name.' });
      } else {
        jwt.sign(
          { admin: false, student },
          process.env.JWT_SECRET,
          (err, token) => {
            if (err) {
              res.status(500).json({ err });
            } else {
              res.status(202).json({ token });
            }
          }
        );
      }
    })
    .catch((err) => console.log(err));
});
router.get('/test', (req, res) => {
  let token = req.headers.token;
  jwt.verify(token, process.env.JWT_SECRET, (err, auth) => {
    if (err) {
      return res.status(401).json({ msg: 'Invalid token.' });
    } else {
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
