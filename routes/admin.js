const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
router.post('/teacher/create', (req, res) => {
  db.query(
    `INSERT INTO teachers (first_name, last_name, username, password, email, is_admin) VALUES ('${
      req.body.firstName
    }','${req.body.lastName}','${req.body.username}','${
      req.body.useDefaultPassword
        ? '$2a$10$21tQ9rVJpGkax0vIN8gUs.Q0TtxGasogeeH5eRlKgnaq2nEwhX2PS'
        : req.body.password
    }','${req.body.email}', ${req.body.isAdmin ? 'true' : 'false'})`,
    (err, data) => {
      if (err) {
        console.error(err);
        res.status(500);
      } else {
        res.status(200).json({});
      }
    }
  );
});
router.get('/teachers', (req, res) => {
  db.query(`SELECT * FROM teachers`, (err, data) => {
    if (err) {
      console.error(err);
      res.status(500);
    } else {
      res.status(200).json(data.rows);
    }
  });
});
router.post('/teacher/resetpassword', (req, res) => {
  if (req.body.teacher_id === null) return res.status(400);
  db.query(
    `UPDATE teachers SET password = '$2a$10$21tQ9rVJpGkax0vIN8gUs.Q0TtxGasogeeH5eRlKgnaq2nEwhX2PS' WHERE teacher_id = '${req.body.teacher_id}'`,
    (err, data) => {
      if (err) {
        console.error(err);
        res.status(500);
      } else {
        res.status(200).json(data);
      }
    }
  );
});
router.get('/feedback', async (req, res) => {
  let feedback = await db.query(`SELECT * FROM feedback ORDER BY created_at DESC`);
  let teacherIds = await db.query(
    `SELECT teacher_id,username FROM teachers WHERE teacher_id IN (SELECT teacher_id FROM feedback)`
  );
  res.status(200).json({ feedback: feedback.rows, teacherIds: teacherIds.rows });
});
router.put('/feedback', (req, res) => {
  db.query(
    `UPDATE feedback SET status = '${req.body.status}', response = '${req.body.response}' WHERE feedback_id = '${req.body.feedback_id}'`,
    (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).json(err);
      } else return res.status(200).json(data);
    }
  );
});
router.delete('/feedback', (req, res) => {
  console.log(req.body);
  console.log(req.headers);
  db.query(`DELETE FROM feedback WHERE feedback_id = '${req.headers.feedback_id}'`, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json(err);
    } else return res.status(200).json(data);
  });
});
module.exports = router;
