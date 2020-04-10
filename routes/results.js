const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
router.post('/', (req, res) => {
  Student.findOne({ name: req.body.name })
    .then((result) => {
      result.scores = [
        ...result.scores,
        {
          test: req.body.testName,
          score: req.body.score,
          correct: req.body.correct,
          total: req.body.total,
          data: req.body.data,
        },
      ];
      result
        .save()
        .then(() => {
          res.status(200);
        })
        .catch((err) => {
          res.status(500).json({
            msg: 'There was an error saving the score to the database.',
          });
        });
    })
    .catch((err) => {
      res.status(404).json({ msg: 'Student not found' });
    });
});

module.exports = router;
