const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const db = require('../../db');
const fastcsv = require('fast-csv');
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
  db.query(
    `INSERT INTO tests (teacher_id, test_name, attempts) VALUES ('${auth.teacher_id}', '${testName}', ${attempts}) RETURNING test_id`,
    (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500);
      } else {
        let queryString = `INSERT INTO testlines (test_id, line_number, word, audio_path) VALUES `;
        for (i = 0; i < words.length; i++) {
          queryString = queryString.concat(
            `('${data.rows[0].test_id}', ${i + 1}, '${words[i].replace(
              "'",
              "''"
            )}', 'https://spelling-tests.s3-us-west-2.amazonaws.com/${
              auth.teacher_id
            }/${words[i].replace("'", "''")}.wav'),`
          );
        }
        queryString = queryString.slice(0, -1);
        db.query(queryString, (err, sdata) => {
          if (err) {
            res.status(500);
            console.error(err);
            db.query(
              `DELETE FROM tests WHERE test_id='${data.rows[0].test_id}'`
            );
          } else {
            if (req.files.file[0] === undefined) {
              // if only one audio file is uploaded
              let file = req.files.file;
              file.mv(
                path.join(
                  audioPath,
                  `/${file.name.replace("'", '%27').replace('.', '%2E')}`
                ),
                () => {
                  fs.readFile(
                    path.join(
                      audioPath,
                      `/${file.name.replace("'", '%27').replace('.', '%2E')}`
                    ),
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
                          .replace('.', '%2E')
                          .toLowerCase()}`,
                        Body: fs.createReadStream(
                          path.join(
                            audioPath,
                            `/${file.name
                              .replace("'", '%27')
                              .replace('.', '%2E')}`
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
              // multiple files
              req.files.file.map((file) => {
                file.mv(path.join(audioPath, `/${file.name}`), () => {
                  fs.readFile(
                    path.join(audioPath, `/${file.name}`),
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
                        Key: `${auth.teacher_id}/${file.name.toLowerCase()}`,
                        Body: fs.createReadStream(
                          path.join(audioPath, `/${file.name}`)
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
                });
              });
            }
          }
        });
      }
    }
  );
});

router.get('/export', async (req, res) => {
  let auth = res.locals.auth;
  let exportData = await db.query(
    `SELECT student_id, test_id, group_id, score, total, correct, created_at, attempt FROM results WHERE teacher_id = '${auth.teacher_id}' LIMIT 1844674407370955161`
  );
  let studentData = await db.query(
    `SELECT student_id, first_name, last_name FROM students WHERE teacher_id = '${auth.teacher_id}'`
  );
  let groupData = await db.query(
    `SELECT group_id, group_name FROM groups WHERE teacher_id = '${auth.teacher_id}'`
  );
  let testData = await db.query(
    `SELECT test_id, test_name FROM tests WHERE teacher_id = '${auth.teacher_id}'`
  );
  let replacedValues = exportData.rows.map((row) => {
    // Change date to a more readable format
    let newDate = new Date(row.created_at);
    row['Date'] = newDate.toLocaleDateString();
    delete row.created_at;

    // Replace student_id with the first and last name
    let student = studentData.rows.find(
      (student) => student.student_id === row.student_id
    );
    row['First Name'] = student.first_name;
    row['Last Name'] = student.last_name;
    delete row.student_id;

    // Replace test_id with test name
    let _test = testData.rows.find((tst) => tst.test_id === row.test_id);
    row['Test Name'] = _test.test_name;
    delete row.test_id;

    // Replace group_id with group name
    let grp = groupData.rows.find((grp) => grp.group_id === row.group_id);
    row['Group Name'] = grp.group_name;
    delete row.group_id;

    row['Score'] = row.score;
    delete row.score;

    row['Correct'] = row.correct;
    delete row.correct;

    row['Total'] = row.total;
    delete row.total;

    row['Attempt'] = row.attempt;
    delete row.attempt;

    return row;
  });
  const ws = fs.createWriteStream('./data/export.csv');
  const jsonData = JSON.parse(JSON.stringify(exportData.rows));
  fastcsv
    // write the JSON data as a CSV file
    .write(jsonData, { headers: true })
    .pipe(ws)

    .on('finish', () => {
      return res
        .status(200)
        .attachment('exports.csv')
        .sendFile(path.join(__dirname, '../../data/export.csv'));
    });
});
router.get('/report', async (req, res) => {
  let auth = res.locals.auth;
  let params = JSON.parse(req.headers.params);
  let exportType = req.headers.exporttype;
  let exportData;
  switch (exportType) {
    case 'test':
      if (params.testId === undefined)
        return res.status(400).json({
          msg:
            'An error occured finding the test you requested. Please try again. If this continues reload the page.',
        });
      exportData = await db.query(
        `SELECT student_id, test_id, group_id, score, total, correct, created_at, attempt FROM results WHERE teacher_id = '${auth.teacher_id}' AND test_id = '${params.testId}' LIMIT 1844674407370955161`
      );
      break;
    case 'date':
      exportData = await db.query(
        `SELECT student_id, test_id, group_id, score, total, correct, created_at, attempt FROM results WHERE teacher_id = '${auth.teacher_id}' AND created_at BETWEEN TO_TIMESTAMP(${params.startDate}) AND TO_TIMESTAMP(${params.endDate}) LIMIT 1844674407370955161`
      );
      break;
    default:
      break;
  }
  let studentData = await db.query(
    `SELECT student_id, first_name, last_name FROM students WHERE teacher_id = '${auth.teacher_id}'`
  );
  let groupData = await db.query(
    `SELECT group_id, group_name FROM groups WHERE teacher_id = '${auth.teacher_id}'`
  );
  let testData = await db.query(
    `SELECT test_id, test_name FROM tests WHERE teacher_id = '${auth.teacher_id}'`
  );

  let replacedValues = exportData.rows.map((row) => {
    // Change date to a more readable format
    let newDate = new Date(row.created_at);
    row['Date'] = newDate.toLocaleDateString();
    delete row.created_at;

    // Replace student_id with the first and last name
    let student = studentData.rows.find(
      (student) => student.student_id === row.student_id
    );
    row['First Name'] = student.first_name;
    row['Last Name'] = student.last_name;
    delete row.student_id;

    // Replace test_id with test name
    let _test = testData.rows.find((tst) => tst.test_id === row.test_id);
    row['Test Name'] = _test.test_name;
    delete row.test_id;

    // Replace group_id with group name
    let grp = groupData.rows.find((grp) => grp.group_id === row.group_id);
    row['Group Name'] = grp.group_name;
    delete row.group_id;

    row['Score'] = row.score;
    delete row.score;

    row['Correct'] = row.correct;
    delete row.correct;

    row['Total'] = row.total;
    delete row.total;

    row['Attempt'] = row.attempt;
    delete row.attempt;

    return row;
  });
  const ws = fs.createWriteStream('./data/export.csv');
  const jsonData = JSON.parse(JSON.stringify(exportData.rows));
  console.log(jsonData);
  fastcsv
    // write the JSON data as a CSV file
    .write(jsonData, { headers: true })
    .pipe(ws)

    .on('finish', () => {
      return res
        .status(200)
        .attachment('exports.csv')
        .sendFile(path.join(__dirname, '../../data/export.csv'));
    });
});

module.exports = router;
