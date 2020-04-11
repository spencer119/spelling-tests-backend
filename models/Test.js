const mongoose = require('mongoose');

const TestSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  words: {
    type: Array,
    required: true,
  },
});

module.exports = mongoose.model('Test', TestSchema);
