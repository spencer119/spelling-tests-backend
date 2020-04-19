const mongoose = require('mongoose');

const AdminSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  permissions: {
    type: Object,
    required: true,
  },
});

module.exports = mongoose.model('Admin', AdminSchema);
