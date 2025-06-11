/* 사용자자 api */
const express = require('express');
const db = require('../config/db');
const { SELECT } = require('sequelize/lib/query-types');

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
                return res.status(200).json({ user_id: user.id });
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
router.get('/info/:user_id', async (req, res) => {

    const { user_id } = req.params;

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

// 회원 정보 수정
router.patch('/update/:user_id', async (req, res) => {

    const { user_id } = req.params;
    const { nickname, email, age } = req.body;

    try{
        // 수정할 필드만 동적으로 구성
        const fields = [];
        const values = [];
        
        if(nickname) {
            fields.push('nickname = ?');
            values.push(nickname);
        }
        if(email) {
            fields.push('email = ?');
            values.push(email);
        }
        if(age) {
            fields.push('age = ?');
            values.push(age);
        }

        if (fields.length === 0) {
            return res.status(400).send({ err: '수정할 정보가 없습니다.' });
        }

        values.push(user_id);

        const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
        await db.query(query, values);
        res.send('회원 정보가 수정되었습니다!');

    } catch (err) {
        console.error(err);
        res.status(500).send({err: 'Database error'});
    }
});

// 회원 탈퇴
router.delete('/delete/:user_id', async (req, res) => {

    const { user_id } = req.params;

    try{
        await db.query('DELETE FROM users WHERE id = ?', [user_id]);
        res.send('회원 탈퇴 되었습니다!');
        req.session.destroy;

    } catch (err) {
        console.error(err);
        res.status(500).send({err: 'Database error'});
    }
});

// 사용자 level 정보
router.get('/level/:user_id', async (req, res) => {

    const { user_id } = req.params;

    try {
        const [user_level] = await db.query('SELECT level FROM users WHERE id = ?', [user_id]);
        const [learned_num] = await db.query('SELECT COUNT(thing) AS learned_num FROM user_learned WHERE user_id = ?', [user_id]);

        const level = user_level[0].level;
        const learned = learned_num[0].learned_num;
        const need_num = (level*10) + 10;  

        if(learned == need_num) level++;

        res.send({
            "now_level" : level,
            "next_level" : level + 1,
            "need_study_num" : need_num - learned,
            "studied_num" : learned
        });

    } catch (err) {
        console.error(err);
        res.status(500).send({err: 'Database error'});
    }
});

module.exports = router;