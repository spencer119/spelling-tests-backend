const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Group = require('../models/Group');
const Test = require('../models/Test');
require('dotenv/config');
const db = require('../db');
router.get('/testId', (req, res) => {
  let token = req.headers.token;
  jwt.verify(token, process.env.JWT_SECRET, async (err, auth) => {
    if (err) {
      res.status(500);
    } else {
      db.query(
        `SELECT active_test FROM groups WHERE group_id='${auth.group_id}'`,
        (err, data) => {
          if (err) {
            return res.status(500);
          } else {
            db.query(`SELECT * FROM results WHERE test_id = '${data.rows[0].active_test}' AND student_id = '${auth.student_id}'`, (err, sdata) => {
                return res.status(200).json({
                  test_id: data.rows[0].active_test,
                  first_name: auth.first_name,
                  attempts: sdata.rows.length
                });
              
            })
            
          }
        }
      );
    }
  });
});
router.get('/test', (req, res) => {
  let token = req.headers.token;
  jwt.verify(token, process.env.JWT_SECRET, async (err, auth) => {
    if (err) {
      res.status(500);
    } else {
      db.query(
        `SELECT * FROM testlines WHERE test_id = '${req.query.test_id}' ORDER BY line_number`,
        (err, data) => {
          if (err) {
            return res.status(500);
          } else {
            res.json({ test_id: req.query.test_id, testlines: data.rows });
          }
        }
      );
    }
  });
});
router.post('/test/submit', (req, res) => {
  let token = req.headers.token;
  let testData = req.body.testData
  console.log(req.body)
  jwt.verify(token, process.env.JWT_SECRET, async (err, auth) => {
    if (err) {
      return res.status(403);
    }
    let total = 0;
    let correct = 0;
    testData.map(x => {
      if (x.ans === x.word) correct++;
      total++;
    })
    let score = correct / total;

    db.query(`INSERT INTO results (student_id, test_id, teacher_id, group_id, correct, total, score) VALUES ('${auth.student_id}', '${req.body.test_id}', '${auth.teacher_id}', '${auth.group_id}', ${correct}, ${total}, ${score}) RETURNING result_id`, (err, data) => {
      if (err) {
        console.error(err)
        return res.status(500)
      } else {
        let queryString = `INSERT INTO resultdata (result_id, word, answer, correct) VALUES `;
        testData.forEach(x => {
          queryString = queryString.concat(`('${data.rows[0].result_id}', '${x.word}', '${x.ans}', ${x.word === x.ans ? true : false}),`)
        })
        queryString = queryString.slice(0, -1);
        db.query(queryString, (err, sdata) => {
          if (err) {
            console.error(err);
            db.query(`DELETE FROM results WHERE result_id = '${data.rows[0].result_id}'`)
            return res.status(500)
          } else {
            res.status(200).json()
          }
        })
      }
    })
  });
});

module.exports = router;
