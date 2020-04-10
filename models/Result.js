const mongoose = require('mongoose');

const ResultSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  score: {
      type: Number,
      required: true
  },
  total: {
      type: Number,
      required:  true
  }
});

module.exports = mongoose.model('Result', ResultSchema);
