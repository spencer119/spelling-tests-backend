const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Group = require('../models/Group');
const Test = require('../models/Test');
require('dotenv/config');
const db = require('../db');
router.get('/testId', (req, res) => {
  let token = req.headers.token;
  jwt.verify(token, process.env.JWT_SECRET, async (err, auth) => {
    if (err) {
      res.status(500);
    } else {
      db.query(
        `SELECT active_test FROM groups WHERE group_id='${auth.group_id}'`,
        (err, data) => {
          if (err) {
            return res.status(500);
          } else {
            return res.status(200).json({
              test_id: data.rows[0].active_test,
              first_name: auth.first_name,
            });
          }
        }
      );
    }
  });
});
router.get('/test', (req, res) => {
  let token = req.headers.token;
  jwt.verify(token, process.env.JWT_SECRET, async (err, auth) => {
    if (err) {
      res.status(500);
    } else {
      db.query(
        `SELECT * FROM testlines WHERE test_id = '${req.query.test_id}' ORDER BY line_number`,
        (err, data) => {
          if (err) {
            return res.status(500);
          } else {
            res.json({ test_id: req.query.test_id, testlines: data.rows });
          }
        }
      );
    }
  });
});

module.exports = router;
