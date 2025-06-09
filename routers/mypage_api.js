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

// 사용자 학습 현황
router.get('/record', async (req, res) => {
    try {
        const user_id = req.session.user?.id;

        if (!user_id) {
            return res.status(404).send({ err: '사용자를 찾을 수 없습니다.' });
        }

        const [learned_word_num] = await db.query(
            'SELECT COUNT(thing) AS word_num FROM user_learned WHERE t_type = "word" AND user_id = ?', [user_id]
        );

        const [learned_text_num] = await db.query(
            'SELECT COUNT(thing) AS text_num FROM user_learned WHERE t_type = "text" AND user_id = ?', [user_id]
        );

        const [wong_word_num] = await db.query(
            'SELECT COUNT(*) AS wong_word_num FROM wong_words WHERE user_id = ?', [user_id]
        );

        const [right_word_num] = await db.query(
            'SELECT COUNT(*) AS right_word_num FROM right_words WHERE user_id = ?', [user_id]
        );

        
        if (!learned_word_num || !learned_text_num || !wong_word_num) {
            return res.status(404).send({ err: '정보를 가져올 수 없습니댜.' });
        }

        const word_num = learned_word_num[0].word_num;
        const text_num = learned_text_num[0].text_num;
        const wong_num = wong_word_num[0].wong_word_num;
        const right_num = right_word_num[0].right_word_num;

        res.send({
            learned_word_num : word_num,
            learned_text_num: text_num,
            wong_word_num : wong_num,
            right_word_num: right_num
        });

    } catch (err) {
        console.error(err);
        res.status(500).send({ err: 'Database error' });
    }
});

module.exports = router;