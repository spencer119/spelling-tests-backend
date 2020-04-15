const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv/config');
const app = express();
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Headers', '*');
    return res.status(200).json({});
  }
  next();
});
app.use(cors());
app.use(express.static('./data/'));
app.use(express.json());

app.use('/api/teacher', require('./routes/teacher'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/results', require('./routes/results'));
app.use('/api/user', require('./routes/user'));

// Connect to database
mongoose.connect(
  process.env.DB_CONNECTION,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log('Connected to Database');
  }
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
