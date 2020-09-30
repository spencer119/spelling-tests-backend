const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const Group = require('../models/Group');
const Test = require('../models/Test');
const Result = require('../models/Result');
const db = require('../db');
let audioPath = path.join(__dirname, '../data/audio');
router.get('/', (req, res) => {
  // gets everything corresponding to the teacher, students, classes, groups
  let token = req.headers.token;
  jwt.verify(token, process.env.JWT_SECRET, async (err, auth) => {
    if (err) {
      return res.status(403);
    }
    if (auth.teacher_id) {
      let students = await db.query(
        `SELECT * FROM students WHERE teacher_id='${auth.teacher_id}'`
      );
      let groups = await db.query(
        `SELECT * FROM groups WHERE teacher_id='${auth.teacher_id}'`
      );
      let classes = await db.query(
        `SELECT * FROM classes WHERE teacher_id='${auth.teacher_id}'`
      );
      let tests = await db.query(
        `SELECT * FROM tests WHERE teacher_id='${auth.teacher_id}'`
      );

      res.status(200).json({
        students: students.rows,
        groups: groups.rows,
        classes: classes.rows,
        tests: tests.rows
      });
    } else {
      return res.status(403).json({ msg: 'Unauthorized' });
    }
  });
});
router.get('/student', (req, res) => {
  let token = req.headers.token;
  jwt.verify(token, process.env.JWT_SECRET, async (err, auth) => {
    if (err) {
      return res.status(403);
    }
    if (auth.teacher_id) {
      let studentData = await db.query(
        `SELECT * FROM students WHERE student_id='${req.headers.student_id}'`
      );
      let student = studentData.rows;
      res.status(200).json({
        student,
      });
    } else {
      return res.status(403).json({ msg: 'Unauthorized' });
    }
  });
});
router.post('/student', (req, res) => {
  let token = req.headers.token;
  jwt.verify(token, process.env.JWT_SECRET, async (err, auth) => {
    if (err) {
      return res.status(403);
    }
    if (auth.teacher_id) {
      db.query(
        `INSERT INTO students (first_name, last_name, username, teacher_id, class_id, group_id) VALUES ('${
          req.body.firstName
        }', '${req.body.lastName}', '${req.body.username}', '${
          auth.teacher_id
        }' ${req.body.classId === '' ? '' : `,'${req.body.classId}'`} ${
          req.body.groupId === '' ? '' : `, '${req.body.groupId}'`
        })`,
        (err, data) => {
          if (err) {
            return res.status(500);
          } else {
            return res.status(201).json(data);
          }
        }
      );
    } else {
      return res.status(403).json({ msg: 'Unauthorized' });
    }
  });
});
router.get('/groups', (req, res) => {
  let token = req.headers.token;
  jwt.verify(token, process.env.JWT_SECRET, async (err, auth) => {
    if (err) {
      res.status(403).json({ err });
    } else {
      if (auth.teacher_id) {
        db.query(
          `SELECT * FROM groups WHERE teacher_id='${auth.teacher_id}'`,
          (err, data) => {
            if (err) {
              res.status(500);
            } else {
              res.status(200).json(data.rows);
            }
          }
        );
      } else {
        res.status(401).json({ msg: 'Unauthorized' });
      }
    }
  });
});
router.post('/group', (req, res) => {
  let token = req.headers.token;
  jwt.verify(token, process.env.JWT_SECRET, async (err, auth) => {
    if (err) {
      return res.status(403);
    }
    if (auth.teacher_id) {
      db.query(
        `INSERT INTO groups (group_name, teacher_id, class_id) VALUES ('${req.body.group_name}', '${auth.teacher_id}', '${req.body.class_id}')`,
        (err, data) => {
          if (err) {
            console.log(err);
            res.status(500).json({ err });
          } else {
            res.status(201).json(data);
          }
        }
      );
    } else {
      return res.status(403).json({ msg: 'Unauthorized' });
    }
  });
});
router.get('/classes', (req, res) => {
  let token = req.headers.token;
  jwt.verify(token, process.env.JWT_SECRET, async (err, auth) => {
    if (err) {
      res.status(403).json({ err });
    } else {
      if (auth.teacher_id) {
        let classData = await db.query(
          `SELECT * FROM classes WHERE teacher_id='${auth.teacher_id}'`
        );
        res.status(200).json(classData.rows);
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
      if (auth.teacher_id) {
        db.query(`SELECT * FROM tests WHERE teacher_id='${auth.teacher_id}'`, (err, data) => {
          if (err) {
            res.status(500).json(err);
          } else {
            let testIDs = '';
            data.rows.forEach(test => {
              testIDs = testIDs.concat(`'${test.test_id}',`)
            })
            testIDs = testIDs.slice(0, -1)
            db.query(`SELECT * FROM testlines WHERE test_id IN (${testIDs})`, (err, sdata) => {
              if (err) {
                res.status(500).json(err);
              } else {
                res.status(200).json({tests: data.rows, testlines: sdata.rows})
              }
            })
          }
        })
      } else {
        res.status(401).json({ msg: 'Unauthorized' });
      }
    }
  });
});
router.post('/tests', (req, res) => {
  let userToken = req.headers.token;
  jwt.verify(userToken, process.env.JWT_SECRET, async (err, auth) => {
    if (err) {
      res.status(403).json({ err });
    } else {
      if (auth.teacher_id) {
        let words = req.body.words;
        let testName = req.body.name;
        db.query(`INSERT INTO tests (teacher_id, test_name) VALUES ('${auth.teacher_id}', '${testName}') RETURNING test_id`, (err, data) => {
          if (err) {
            return res.status(500);
          } else {
            let queryString = `INSERT INTO testlines (test_id, line_number, word) VALUES `;
            for (i=0; i < words.length; i++)
            {
              queryString = queryString.concat(`('${data.rows[0].test_id}', ${i + 1}, '${words[i]}'),`)
            }
              queryString = queryString.slice(0, -1)
            db.query(queryString, (err,sdata) => {
              if (err) {
                res.status(500);
                db.query(`DELETE FROM tests WHERE test_id='${data.rows[0].test_id}'`)
              } else {
                res.status(201).json({})
              }
            })
          }
        })
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
      console.log(auth);
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
