const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
router.post('/teacher/create', (req,res) => {
    console.log(req.headers);
    console.log(req.body) 
    db.query(`INSERT INTO teachers (first_name, last_name, username, password, email, is_admin) VALUES ('${req.body.firstName}','${req.body.lastName}','${req.body.username}','${req.body.useDefaultPassword ? '$2a$10$21tQ9rVJpGkax0vIN8gUs.Q0TtxGasogeeH5eRlKgnaq2nEwhX2PS' : req.body.password}','${req.body.email}', ${req.body.isAdmin ? 'true' : 'false'})`, (err,data) => {
        if (err) {
            console.error(err)
        } else {
            res.status(200).json({})
        }
    })
})
module.exports = router;
