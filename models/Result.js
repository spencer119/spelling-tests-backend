const mongoose = require('mongoose');

const ResultSchema = mongoose.Schema({
  time: {
    type: Date,
    default: Date.now(),
  },
  name: {
    type: String,
    required: true,
  },
  group: {
    type: String,
    required: true,
  },
  test: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  correct: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  data: {
    type: Array,
    required: true,
  },
});

module.exports = mongoose.model('Result', ResultSchema);
