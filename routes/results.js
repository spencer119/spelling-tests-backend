const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Test = require('../models/Test');
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
      result.save().then(() => {
        Test.findOne({ name: req.body.testName }).then((result) => {
          console.log(result);
          result.scores = [
            ...result.scores,
            {
              name: req.body.name,
              test: req.body.testName,
              score: req.body.score,
              correct: req.body.correct,
              total: req.body.total,
              data: req.body.data,
            },
          ];
          result
            .save()
            .then(() => res.status(200))
            .catch(() =>
              res.status(500).json({
                msg: 'There was an error saving the score to the database.',
              })
            );
        });
      });
    })
    .catch(() => {
      res.status(500).json({
        msg: 'There was an error saving the score to the database.',
      });
    });
});

module.exports = router;
