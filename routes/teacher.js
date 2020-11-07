const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const db = require('../db');
const AWS = require('aws-sdk');
AWS.config.update({accessKeyId: process.env.AWS_KEY_ID, secretAccessKey: process.env.AWS_SECRET})
let s3 = new AWS.S3();
let audioPath = path.join(__dirname, '../data/audio');
router.get('/', async (req, res) => {
  let auth = res.locals.auth;
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
  let results = await db.query(
    `SELECT * FROM results WHERE teacher_id='${auth.teacher_id}'`
  );

  res.status(200).json({
    students: students.rows,
    groups: groups.rows,
    classes: classes.rows,
    tests: tests.rows,
    results: results.rows
  });
});
router.get('/result', (req, res) => {
  let token = req.headers.token;
  let result_id = req.headers.result_id;
  jwt.verify(token, process.env.JWT_SECRET, async (err, auth) => {
    if (err) {
      return res.status(403);
    }
    if (auth.teacher_id) {
      let result = await db.query(`SELECT * FROM results WHERE result_id = '${result_id}'`);
      let resultdata = await db.query(`SELECT * FROM resultdata WHERE result_id = '${result_id}'`)
      let test_name = await db.query(`SELECT test_name FROM tests WHERE test_id = '${result.rows[0].test_id}'`)
      let student = await db.query(`SELECT first_name, last_name, username FROM students WHERE student_id = '${result.rows[0].student_id}'`)
      res.status(200).json({result: result.rows[0], resultdata: resultdata.rows, test_name: test_name.rows[0].test_name, student: student.rows[0]})
      
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
            return res.status(500).json(err);
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
router.post('/students/edit', (req, res) => {
  let token = req.headers.token;
  let student_id = req.body.student_id;
  let class_id = req.body.class_id;
  let group_id = req.body.group_id;
  jwt.verify(token, process.env.JWT_SECRET, async (err, auth) => {
    if (err) {
      return res.status(403);
    }
    if (auth.teacher_id) {
      db.query(
        `UPDATE students SET class_id = '${class_id}', group_id = '${group_id}' WHERE student_id = '${student_id}'`,
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
router.post('/classes', (req, res) => {
  let token = req.headers.token;
  jwt.verify(token, process.env.JWT_SECRET, async (err, auth) => {
    if (err) {
      return res.status(403);
    }
    if (auth.teacher_id) {
      db.query(
        `INSERT INTO classes (class_name, teacher_id) VALUES ('${req.body.class_name}', '${auth.teacher_id}')`,
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
router.put('/groups', (req, res) => {
  let token = req.headers.token;
  jwt.verify(token, process.env.JWT_SECRET, async (err, auth) => {
    if (err) {
      res.status(403).json({ err });
    } else {
      if (auth.teacher_id) {
        if (req.body.new_test === '') {
          db.query(
            `UPDATE groups SET active_test = NULL WHERE group_id = '${req.body.group_id}'`,
            (err, data) => {
              if (err) {
                res.status(500).json(err);
              } else {
                res.status(200).json();
              }
            }
          );
        } else {
          db.query(
            `UPDATE groups SET active_test = '${req.body.new_test}' WHERE group_id = '${req.body.group_id}'`,
            (err, data) => {
              if (err) {
                res.status(500).json(err);
              } else {
                res.status(200).json();
              }
            }
          );
        }
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
        db.query(
          `SELECT * FROM tests WHERE teacher_id='${auth.teacher_id}'`,
          (err, data) => {
            if (err) {
              res.status(500).json(err);
            } else {
              if (data.rows.length < 1) return res.status(200).json({tests: [], testlines: []})
              let testIDs = '';
              data.rows.forEach((test) => {
                testIDs = testIDs.concat(`'${test.test_id}',`);
              });
              testIDs = testIDs.slice(0, -1);
              db.query(
                `SELECT * FROM testlines WHERE test_id IN (${testIDs})`,
                (err, sdata) => {
                  if (err) {
                    res.status(500).json(err);
                  } else {
                    res
                      .status(200)
                      .json({ tests: data.rows, testlines: sdata.rows });
                  }
                }
              );
            }
          }
        );
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
        let words = req.body.words.split(',');
        let testName = req.body.name;
        let filetype = req.body.filetype
        // Check files and word matches
        console.log(words)
        if (filetype === 'm4a')
        {
          let checkArr = words;
          let invalidFile = false;
          req.files.file.map(f => {
            if (f.mimetype !== 'audio/x-m4a') invalidFile = true
            checkArr = checkArr.filter(word => word !== f.name.replace('.m4a', ''))
          })
          if (invalidFile) return res.status(400).json({msg: 'Please make sure all the files match the file type (.m4a) you selected.'})
          if (checkArr.length !== 0) return res.status(400).json({msg: 'Please make sure every word has an audio file spelled the EXACT same way.'})
        } else if (filetype === 'mp3')
        {
          let checkArr = words;
          let invalidFile = false;
          console.log(req.files.file)
          req.files.file.map(f => {
            if (f.mimetype !== 'audio/mpeg') invalidFile = true
            checkArr = checkArr.filter(word => word !== f.name.replace('.mp3', ''))
          })
          if (invalidFile) return res.status(400).json({msg: 'Please make sure all the files match the file type (.mp3) you selected.'})
          if (checkArr.length !== 0) return res.status(400).json({msg: 'Please make sure every word has an audio file spelled the EXACT same way.'})
        } else return res.status(400).json({msg: 'Invalid file type.'})
        
        console.log(req.files.file)
        db.query(
          `INSERT INTO tests (teacher_id, test_name) VALUES ('${auth.teacher_id}', '${testName}') RETURNING test_id`,
          (err, data) => {
            if (err) {
              return res.status(500);
            } else {
              let queryString = `INSERT INTO testlines (test_id, line_number, word, audio_path) VALUES `;
              for (i = 0; i < words.length; i++) {
                if (filetype === 'mp3') {
                  queryString = queryString.concat(
                    `('${data.rows[0].test_id}', ${i + 1}, '${words[i]}', 'https://spelling-tests.s3-us-west-2.amazonaws.com/${auth.teacher_id}/${words[i].toLowerCase()}.mp3'),`
                  );
                } else {
                  queryString = queryString.concat(
                    `('${data.rows[0].test_id}', ${i + 1}, '${words[i]}', 'https://spelling-tests.s3-us-west-2.amazonaws.com/${auth.teacher_id}/${words[i].toLowerCase()}.m4a'),`
                  );
                }
                
              }
              queryString = queryString.slice(0, -1);
              db.query(queryString, (err, sdata) => {
                if (err) {
                  res.status(500);
                  db.query(
                    `DELETE FROM tests WHERE test_id='${data.rows[0].test_id}'`
                  );
                } else {
                  if (req.files.file[0] === undefined) { // if only one audio file is uploaded
                    let file = req.files.file
                    file.mv(path.join(audioPath, `/${file.name.replace("'", '%27')}`), () => {
                      fs.readFile(path.join(audioPath, `/${file.name.replace("'", '%27')}`), (err, fsdata) => {
                        if (err) {
                          console.error(err);
                          db.query(
                            `DELETE FROM tests WHERE test_id='${data.rows[0].test_id}'`
                          );
                          return res.status(500)
                        }
                        const params = {
                          Bucket: 'spelling-tests',
                          Key: `${auth.teacher_id}/${file.name.replace("'", '%27').toLowerCase()}`,
                          Body: fs.createReadStream(path.join(audioPath, `/${file.name.replace("'", '%27')}`)),
                          ACL: 'public-read'
                        };
                        s3.upload(params, (s3err, s3data) => {
                          if (s3err) {
                            console.error(s3err);
                            db.query(
                              `DELETE FROM tests WHERE test_id='${data.rows[0].test_id}'`
                            );
                            return res.status(500)
                          } else {
                            res.status(201).json();
                          }
                        })
                      })
                    });
                  } else {
                    req.files.file.map((file) => {
                      file.mv(path.join(audioPath, `/${file.name.replace("'", '%27')}`), () => {
                        fs.readFile(path.join(audioPath, `/${file.name.replace("'", '%27')}`), (err, fsdata) => {
                          if (err) {
                            console.error(err);
                            db.query(
                              `DELETE FROM tests WHERE test_id='${data.rows[0].test_id}'`
                            );
                            return res.status(500)
                          }
                          const params = {
                            Bucket: 'spelling-tests',
                            Key: `${auth.teacher_id}/${file.name.replace("'", '%27').toLowerCase()}`,
                            Body: fs.createReadStream(path.join(audioPath, `/${file.name.replace("'", '%27')}`)),
                            ACL: 'public-read'
                          };
                          s3.upload(params, (s3err, s3data) => {
                            if (s3err) {
                              console.error(s3err);
                              db.query(
                                `DELETE FROM tests WHERE test_id='${data.rows[0].test_id}'`
                              );
                              return res.status(500)
                            } else {
                              res.status(201).json();
                            }
                          })
                        })
                      });
                      
                    });
                  }
                }
              });
            }
          }
        );
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
      if (auth.teacher_id) {
        console.log(req.body)
        db.query(`DELETE from tests WHERE test_id='${req.body.test}'`, (err, data) => {
          if (err) {
            console.error(err)
            res.status(500).json(err);
          } else {
            res.status(200).json(data)
          }
        })
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
      if (auth.teacher_id) {
        db.query(`SELECT * FROM results WHERE teacher_id = '${auth.teacher_id}'`, (err, data) => {
          res.status(200).json(data.rows)
        })
      } else {
        res.status(401).json({ msg: 'Unauthorized' });
      }
    }
  });
});

module.exports = router;
