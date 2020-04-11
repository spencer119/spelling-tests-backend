const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Test = require('../models/Test');
router.post('/', (req, res) => {
  console.log(req.body);
  Student.findOne({ name: req.body.name.toLowerCase() })
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
            .then(() => res.status(200).json({ msg: 'Success' }))
            .catch((err) => {
              console.log(err);
              res.status(500).json({
                msg: 'There was an error saving the score to the database.',
              });
            });
        });
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        msg: 'There was an error saving the score to the database.',
      });
    });
});

module.exports = router;
