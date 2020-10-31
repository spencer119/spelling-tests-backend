const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv/config');
const fileUpload = require('express-fileupload');
const app = express();

app.use(cors({origin: true,credentials:true}));
app.use(express.static('./data/'));
app.use(express.json());
app.use(fileUpload());
const maintenance = false;
app.options('*', cors())

// Routes
app.use('/api/teacher', require('./routes/teacher'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/results', require('./routes/results'));
app.use('/api/student', require('./routes/student'));
app.use('/api/admin', require('./routes/admin'));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "https://brmesspelling.netlify.app"); 
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
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
