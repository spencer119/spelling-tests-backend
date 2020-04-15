const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const Group = require('../models/Group');
const Test = require('../models/Test');
router.get('/groups', (req, res) => {
  let userToken = req.headers.token;
  jwt.verify(userToken, process.env.JWT_SECRET, async (err, auth) => {
    if (err) {
      res.status(403).json({ err });
    } else {
      if (auth.admin) {
        Group.find({}).then((groups) => {
          console.log(groups);
          res.json(groups);
        });
      } else {
        res.status(401).json({ msg: 'Unauthorized' });
      }
    }
  });
});
router.put('/groups', (req, res) => {
  console.log(req);
  let userToken = req.body.token;
  jwt.verify(userToken, process.env.JWT_SECRET, async (err, auth) => {
    if (err) {
      res.status(403).json({ err });
    } else {
      if (auth.admin) {
        Group.findOne({ name: req.body.group }).then((group) => {
          group.activeTest = req.body.newTest;
          group.save().then(() => {
            res.status(200).json({ msg: 'Test updated' });
          });
        });
      } else {
        res.status(401).json({ msg: 'Unauthorized' });
      }
    }
  });
});
router.get('/tests', (req, res) => {
  let userToken = req.headers.token;
  jwt.verify(userToken, process.env.JWT_SECRET, async (err, auth) => {
    if (err) {
      res.status(403).json({ err });
    } else {
      if (auth.admin) {
        Test.find({}).then((tests) => {
          res.json(tests);
        });
      } else {
        res.status(401).json({ msg: 'Unauthorized' });
      }
    }
  });
});
router.post('/tests', (req, res) => {
  let userToken = req.body.token;
  jwt.verify(userToken, process.env.JWT_SECRET, async (err, auth) => {
    if (err) {
      res.status(403).json({ err });
    } else {
      if (auth.admin) {
        let test = new Test({ name: req.body.name, words: req.body.words });
        test.save().then(() => {
          res.status(200).json({ msg: 'Test created' });
        });
      } else {
        res.status(401).json({ msg: 'Unauthorized' });
      }
    }
  });
});
router.delete('/tests', (req, res) => {
  console.log(req);
  let userToken = req.headers.token;
  jwt.verify(userToken, process.env.JWT_SECRET, async (err, auth) => {
    if (err) {
      res.status(403).json({ err });
    } else {
      if (auth.admin) {
        Test.deleteOne({ name: req.body.test })
          .then(() => {
            res.status(200), json({ msg: 'Test deleted' });
          })
          .catch(() =>
            res.json(500).json({ msg: 'There was an error deleting the test' })
          );
      } else {
        res.status(401).json({ msg: 'Unauthorized' });
      }
    }
  });
});

module.exports = router;
