const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Group = require('../models/Group');
const Test = require('../models/Test');
require('dotenv/config');
const db = require('../db');
router.get('/test', (req, res) => {
  let token = req.headers.token;
  let test_id = req.query.test_id;
  db.query(
    `SELECT * FROM testlines WHERE test_id = '${test_id}'`,
    (err, data) => {
      console.log(data);
    }
  );
});

module.exports = router;
