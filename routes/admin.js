const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Group = require('../models/Group');
const Test = require('../models/Test');
router.get('/', (req, res) => {
  let userToken = req.headers.token;
  jwt.verify(userToken, 'secret', (err, auth) => {
    if (err) {
      res.status(403).json({ err });
    } else {
      var resultPath = path.join(__dirname, '../data/results.json');
      var studentPath = path.join(__dirname, '../data/students.json');
      var testsPath = path.join(__dirname, '../data/tests.json');
      var groupsPath = path.join(__dirname, '../data/groups.json');
      let results = JSON.parse(fs.readFileSync(resultPath));
      let tests = [];
      let groups = [];
      let students = JSON.parse(fs.readFileSync(studentPath));
      tests = JSON.parse(fs.readFileSync(testsPath));
      groups = JSON.parse(fs.readFileSync(groupsPath));
      res.json({ auth, results, tests, groups, students });
    }
  });
});

module.exports = router;
