const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const Group = require('../models/Group');
const Test = require('../models/Test');
const Result = require('../models/Result');
let audioPath = path.join(__dirname, '../data/audio');
router.get('/groups', (req, res) => {
  let userToken = req.headers.token;
  jwt.verify(userToken, process.env.JWT_SECRET, async (err, auth) => {
    if (err) {
      res.status(403).json({ err });
    } else {
      if (auth.admin) {
        Group.find({}).then((groups) => {
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
        let missing = [];
        Test.find({}).then((tests) => {
          tests.map((test) => {
            test.words.map((word) => {
              if (
                !fs.existsSync(
                  path.join(audioPath, `/${word.replace("'", '')}.m4a`)
                )
              ) {
                missing.push(word);
              }
            });
          });
          res.json({ tests, missing });
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
router.post('/upload', (req, res) => {
  let userToken = req.headers.token;
  jwt.verify(userToken, process.env.JWT_SECRET, async (err, auth) => {
    if (err) {
      res.status(403).json({ err });
    } else {
      if (auth.admin) {
        if (!req.files || Object.keys(req.files).length === 0) {
          return res.status(400).send('No files were uploaded.');
        }
        if (req.files.file[0] === undefined) {
          req.files.file.mv(
            path.join(audioPath, `/${req.files.file.name.replace("'", '')}`)
          );
        } else {
          req.files.file.map((file) => {
            file.mv(path.join(audioPath, `/${file.name.replace("'", '')}`));
          });
        }
        res.json({ msg: 'files uploaded' });
      } else {
        res.status(401).json({ msg: 'Unauthorized' });
      }
    }
  });
});
router.get('/results', (req, res) => {
  let userToken = req.headers.token;
  jwt.verify(userToken, process.env.JWT_SECRET, async (err, auth) => {
    if (err) {
      res.status(403).json({ err });
    } else {
      if (auth.admin) {
        Result.find({})
          .then((results) => {
            if (!auth.canViewNames) {
              let counter = 1;
              let studentMatches = {};
              results.map((result) => {
                if (studentMatches.hasOwnProperty(result.name)) {
                  result.name = studentMatches[`${result.name}`];
                } else {
                  studentMatches[result.name] = `Student ${counter}`;
                  result.name = `Student ${counter}`;
                }
                return counter++;
              });
              res.json({ results });
            } else {
              res.json({ results });
            }
          })
          .catch((err) => {
            res.status(500).json({ err });
          });
      } else {
        res.status(401).json({ msg: 'Unauthorized' });
      }
    }
  });
});

module.exports = router;
