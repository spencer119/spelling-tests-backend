const mongoose = require('mongoose');

const GroupSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  students: {
    type: Array,
  },
  activeTest: {
    type: String,
  },
});

module.exports = mongoose.model('Group', GroupSchema);
