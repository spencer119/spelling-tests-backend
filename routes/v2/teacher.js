const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const db = require('../../db');
const AWS = require('aws-sdk');
AWS.config.update({
  accessKeyId: process.env.AWS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET,
});
let s3 = new AWS.S3();
let audioPath = path.join(__dirname, '../../data/audio');

router.post('/tests/create', (req, res) => {
  let auth = res.locals.auth;
  let testName = req.body.testName;
  let attempts = req.body.attempts;
  let words = req.body.words.split(',');
  console.log(req.body);
  console.log(req);
  db.query(
    `INSERT INTO tests (teacher_id, test_name, attempts) VALUES ('${auth.teacher_id}', '${testName}', ${attempts}) RETURNING test_id`,
    (err, data) => {
      if (err) {
        return res.status(500);
      } else {
        let queryString = `INSERT INTO testlines (test_id, line_number, word, audio_path) VALUES `;
        for (i = 0; i < words.length; i++) {
          queryString = queryString.concat(
            `('${data.rows[0].test_id}', ${i + 1}, '${
              words[i]
            }', 'https://spelling-tests.s3-us-west-2.amazonaws.com/${
              auth.teacher_id
            }/${words[i].replace("'", '%27').toLowerCase()}.wav'),`
          );
        }
        queryString = queryString.slice(0, -1);
        db.query(queryString, (err, sdata) => {
          if (err) {
            res.status(500);
            db.query(
              `DELETE FROM tests WHERE test_id='${data.rows[0].test_id}'`
            );
          } else {
            if (req.files.file[0] === undefined) {
              // if only one audio file is uploaded
              let file = req.files.file;
              file.mv(
                path.join(audioPath, `/${file.name.replace("'", '%27')}`),
                () => {
                  fs.readFile(
                    path.join(audioPath, `/${file.name.replace("'", '%27')}`),
                    (err, fsdata) => {
                      if (err) {
                        console.error(err);
                        db.query(
                          `DELETE FROM tests WHERE test_id='${data.rows[0].test_id}'`
                        );
                        return res.status(500);
                      }
                      const params = {
                        Bucket: 'spelling-tests',
                        Key: `${auth.teacher_id}/${file.name
                          .replace("'", '%27')
                          .toLowerCase()}`,
                        Body: fs.createReadStream(
                          path.join(
                            audioPath,
                            `/${file.name.replace("'", '%27')}`
                          )
                        ),
                        ACL: 'public-read',
                      };
                      s3.upload(params, (s3err, s3data) => {
                        if (s3err) {
                          console.error(s3err);
                          db.query(
                            `DELETE FROM tests WHERE test_id='${data.rows[0].test_id}'`
                          );
                          return res.status(500);
                        } else {
                          res.status(201).json();
                        }
                      });
                    }
                  );
                }
              );
            } else {
              req.files.file.map((file) => {
                file.mv(
                  path.join(audioPath, `/${file.name.replace("'", '%27')}`),
                  () => {
                    fs.readFile(
                      path.join(audioPath, `/${file.name.replace("'", '%27')}`),
                      (err, fsdata) => {
                        if (err) {
                          console.error(err);
                          db.query(
                            `DELETE FROM tests WHERE test_id='${data.rows[0].test_id}'`
                          );
                          return res.status(500);
                        }
                        const params = {
                          Bucket: 'spelling-tests',
                          Key: `${auth.teacher_id}/${file.name
                            .replace("'", '%27')
                            .toLowerCase()}`,
                          Body: fs.createReadStream(
                            path.join(
                              audioPath,
                              `/${file.name.replace("'", '%27')}`
                            )
                          ),
                          ACL: 'public-read',
                        };
                        s3.upload(params, (s3err, s3data) => {
                          if (s3err) {
                            console.error(s3err);
                            db.query(
                              `DELETE FROM tests WHERE test_id='${data.rows[0].test_id}'`
                            );
                            return res.status(500);
                          } else {
                            res.status(201).json();
                          }
                        });
                      }
                    );
                  }
                );
              });
            }
          }
        });
      }
    }
  );
});

module.exports = router;
