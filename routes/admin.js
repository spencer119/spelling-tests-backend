const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

router.get('/', (req, res) => {
  let userToken = req.headers.token;
  jwt.verify(userToken, 'secret', (err, auth) => {
    if (err) {
      res.status(403).json({ err });
    } else {
      var resultPath = path.join(__dirname, '../data/results.json');
      var studentPath = path.join(__dirname, '../data/students.json');
      var testsPath = path.join(__dirname, '../data/tests');
      var groupsPath = path.join(__dirname, '../data/groups');
      let results = JSON.parse(fs.readFileSync(resultPath));
      let tests = [];
      let groups = [];
      let students = JSON.parse(fs.readFileSync(studentPath));
      fs.readdirSync(testsPath).forEach(file => {
        tests = [
          ...tests,
          JSON.parse(
            fs.readFileSync(path.join(__dirname, '../data/tests', file))
          )
        ];
      });
      fs.readdirSync(groupsPath).forEach(file => {
        groups = [
          ...groups,
          JSON.parse(
            fs.readFileSync(path.join(__dirname, '../data/groups', file))
          )
        ];
      });
      res.json({ auth, results, tests, groups, students });
    }
  });
});

module.exports = router;
