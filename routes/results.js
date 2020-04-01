const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

router.post('/', (req, res) => {
  try {
    var resultPath = path.join(__dirname, '../results.json');
    let rawdata = fs.readFileSync(resultPath);
    let parsed = JSON.parse(rawdata);
    parsed = [...parsed, req.body];
    let data = JSON.stringify(parsed);
    fs.writeFileSync(resultPath, data);
    res.send('Results recorded');
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
