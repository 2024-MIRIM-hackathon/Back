/* 사용자자 api */
const express = require('express');
const db = require('../config/db');

const router = express.Router();

// 회원가입
router.post('/join', async (req, res) => {
    try {
            const { nickname, email, password, age} = req.body;

            if (!nickname || !email || !password || !age) {
                return res.status(400).send({err: 'nickname, email, password and age are reqiored.'});
            }
            const sql = 'INSERT INTO users (nickname, email, password, age, join_date) VALUES (?, ?, ?, ?, CURDATE())';
            await db.query(sql, [nickname, email, password, age]);
            console.log(" 회원 가입 성공!");
            return res.send("회원 가입 성공!");
    } catch (err) {
        console.error(err);
        res.status(500).send({err: 'Database error'});
    }
});

module.exports = router;