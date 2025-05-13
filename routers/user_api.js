/* 사용자자 api */
const express = require('express');
const db = require('../config/db');

const router = express.Router();

// 회원가입
router.post('/join', async (req, res) => {
    try {
        const { nickname, email, password, age} = req.body;

        const [users] = await db.query('SELECT nickname, email FROM users');

        if (!nickname || !email || !password || !age) {
            return res.status(400).send({err: 'nickname, email, password, age 중 입력되지 않은 값이 있습니다.'});
        }
        else if(users.find(u => u.nickname === nickname)) {
            return res.status(400).send({err: '이미 사용중인 nickname 입니다.'});
        }
        else if(users.find(u => u.email === email)) {
            return res.status(400).send({err: '이미 회원가입 된 eamil 입니다.'});
        }

        const sql = 'INSERT INTO users (nickname, email, password, age, join_date) VALUES (?, ?, ?, ?, CURDATE())';
        await db.query(sql, [nickname, email, password, age]);
        return res.send("회원 가입 성공!");

    } catch (err) {
        console.error(err);
        res.status(500).send({err: 'Database error'});
    }
});

// 로그인
router.post('/login', async (req, res) => {
    try {
        const { nickname, password } = req.body;

        if(!nickname || !password) {
            return res.status(400).send({err: 'nickname 또는 password가 입력되지 않았습니다.'});
        }
        const [user_check] = await db.query(
            'SELECT id, nickname, password FROM users');

        const user = user_check.find(u => u.nickname === nickname);

        if (user) {
            if (password === user.password) {
                req.session.user = {id : user.id};
                return res.send("로그인 성공!");
            } else {
                 return res.status(400).send("password를 잘못 입력하셨습니다.");
            }  
        } else {
            return res.status(500).send({err: '사용자를 찾을 수 없습니다.'});
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({err: 'Database error'});
    }
});

// 로그아웃
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('세션 삭제 중 에러:', err);
            return res.status(500).send("로그아웃 실패");
        }
        res.clearCookie('connect.sid');
        return res.send("로그아웃 성공!");
    })
});

// 회원 정보 조회
router.get('/info', async (req, res) => {

    const user_id = req.session.user?.id;
    console.log(user_id);

    try {
        const [user] = await db.query(
            'SELECT nickname, email, age, join_date FROM users WHERE users.id = ?', [user_id]
        );

        console.log(user);

        if(!user){
            return res.status(404).send("사용자 정보를 찾을 수 없습니다.");
        }

        res.send(user[0]);

    } catch (err) {
        console.error(err);
        res.status(500).send({err: 'Database error'});
    }

});

module.exports = router;