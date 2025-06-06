/* 마이페이지 api */
const express = require('express');
const db = require('../config/db');

const router = express.Router();

// 사용자 정보 조회 : 이름, 나이, 이메일, 가입일
router.get('/info', async (req, res) => {

    const user_id = req.session.user?.id;

    try {
        const [user] = await db.query(
            'SELECT nickname, age, email, join_date FROM users WHERE users.id = ?', [user_id]
        );

        if (user.length === 0) {
            return res.status(404).send({ err: '사용자를 찾을 수 없습니다.' });
        }

        const userInfo = user[0];
        const joinDate = new Date(userInfo.join_date);
        const today = new Date();

        const diffTime = today - joinDate;

        // 일단위로 변환
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        res.send({
            nickname: userInfo.nickname,
            age: userInfo.age,
            email: userInfo.email,
            date: diffDays
        });

    } catch (err) {
        console.error(err);
        res.status(500).send({ err: 'Database error' });
    }
});

module.exports = router;