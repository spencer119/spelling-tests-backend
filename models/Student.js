const mongoose = require('mongoose');

const StudentSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  group: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Student', StudentSchema);
