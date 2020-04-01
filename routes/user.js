const express = require('express');
const router = express.Router();
const fs = require('fs');
const jwt = require('jsonwebtoken');
const path = require('path');

const getTest = group => {
  let testID = '';
  let test = {};
  let groups = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../data/groups.json'))
  );
  let tests = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../data/tests.json'))
  );
  groups.map(grp => {
    if (grp.id === group) {
      testID = grp.active_test;
      console.log(testID);
    }
  });
  tests.map(tst => {
    if (tst.id === testID) {
      console.log(tst);
      test = tst;
    }
  });
  return test;
};

const isEmpty = obj => {
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      return false;
    }
  }

  return JSON.stringify(obj) === JSON.stringify({});
};

router.post('/', (req, res) => {
  let name = req.body.name;
  console.log(name);
  var studentPath = path.join(__dirname, '../data/students.json');
  let students = JSON.parse(fs.readFileSync('../data/students.json'));
  let studentData = {};
  let studentFound = false;
  students.map(student => {
    if (student.name === name) {
      studentData = student;
      studentFound = true;
    }
  });
  if (studentFound) {
    jwt.sign({ admin: false, student: studentData }, 'secret', (err, token) => {
      if (err) {
        res.status(500).json({ err });
      } else {
        res.status(202).json({ token });
      }
    });
  } else {
    console.log(studentFound);
    res.status(404).json({ msg: 'Invalid name.' });
  }
});
router.get('/test', (req, res) => {
  let token = req.headers.token;
  jwt.verify(token, 'secret', (err, auth) => {
    let test = getTest(auth.student.group);
    if (isEmpty(test)) {
      res
        .status(404)
        .json({ msg: 'There are no tests available for your group' });
    } else {
      res.status(200).json(test);
    }
  });
});

module.exports = router;
