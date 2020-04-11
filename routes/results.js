const express = require('express');
const router = express.Router();
const Result = require('../models/Result');
const jwt = require('jsonwebtoken');
router.post('/', (req, res) => {
  jwt.verify(req.body.token, process.env.JWT_SECRET, (err, auth) => {
    if (err) {
      res.status(500).json({
        msg:
          'There was an error saving the test to the database. Invalid token',
      });
    } else {
      let newResult = new Result({
        name: auth.student.name,
        group: auth.student.group,
        test: req.body.testName,
        score: req.body.score,
        correct: req.body.correct,
        total: req.body.total,
        data: req.body.data,
      });
      newResult
        .save()
        .then(() => {
          res.status(200).json({ msg: 'Success' });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({
            msg: 'There was an error saving the test to the database.',
          });
        });
    }
  });
});

module.exports = router;
