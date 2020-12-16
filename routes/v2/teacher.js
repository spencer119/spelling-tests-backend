const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const db = require('../../db');
const AWS = require('aws-sdk');
AWS.config.update({ accessKeyId: process.env.AWS_KEY_ID, secretAccessKey: process.env.AWS_SECRET });
let s3 = new AWS.S3();
let audioPath = path.join(__dirname, '../data/audio');

router.post('/tests/create', (req, res) => {
  console.log(req);
});

module.exports = router;
