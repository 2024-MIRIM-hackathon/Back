/* 퀴즈 api */
const express = require('express');
var db = require('../config/db');

const router = express.Router();

// 오늘 배운 단어 퀴즈
router.get('/today', async (req, res) => {
    const user_id = req.session.user?.id;

    const [words] = await db.query(
        'SELECT w.word, w.meaning, w.example, ul.thing FROM user_learned ul JOIN words w ON ul.thing = w.word WHERE ul.learn_date = CURDATE() AND ul.user_id = ?', [user_id]);
        console.log("DB 데이터 : ", words);     // 데이터 구조 확인

    if (!words || words.length === 0) {
        return res.status(404).json({ error: "오늘 학습한 단어가 없습니다." });
    }
    const randomIndex = Math.floor(Math.random() * words.length);
    const word = words[randomIndex];
    const question = words[randomIndex].meaning;

    const remainwords = words.filter(wrd => wrd !== word);
    
    // 정답 제외 랜덤으로 단어 3개 선택
    const randomOptions = [];
    while (randomOptions.length < 3) {
        const randIndex = Math.floor(Math.random() * remainwords.length);
        const randomWord = remainwords[randIndex];

        if (!randomOptions.includes(randomWord)) {
            randomOptions.push(randomWord);
        }
    }

    // 선택지
    const options = [];
    randomOptions.forEach(wrd => {
        options.push(wrd);
    });

    options.push(word);

    const shuffle = (array) => array.sort(() => Math.random() - 0.5);
    const shuffledOptions = shuffle(options);   // 섞인 선택지

    res.json({
        question: question,             // 문제
        options: shuffledOptions,       //선택지
        correct_answer : word.word      // 정답
    });

});

// 배웠던 단어 퀴즈
router.get('/random', async (req, res) => {
    const user_id = req.session.user?.id;
    console.log(user_id);

    const [words] = await db.query(
        'SELECT w.word, w.meaning, w.example, ul.thing FROM user_learned ul JOIN words w ON ul.thing = w.word AND ul.user_id = ?', [user_id]);
    console.log("DB 데이터 : ", words);     // 데이터 구조 확인

    if (!words || words.length === 0) {
        return res.status(404).json({ error: "학습한 단어가 없습니다." });
    }
    const randomIndex = Math.floor(Math.random() * words.length);
    const word = words[randomIndex];        // 정답 단어
    const question = words[randomIndex].meaning;

    const remainwords = words.filter(wrd => wrd !== word);

    // 정답 제외 랜덤으로 단어 3개 선택
    const randomOptions = [];
    while (randomOptions.length < 3) {
        const randIndex = Math.floor(Math.random() * remainwords.length);
        const randomWord = remainwords[randIndex];

        if (!randomOptions.includes(randomWord)) {
            randomOptions.push(randomWord);
        }
    }

    // 선택지
    const options = [];
    randomOptions.forEach(wrd => {
        options.push(wrd);
    });

    options.push(word);

    const shuffle = (array) => array.sort(() => Math.random() - 0.5);
    const shuffledOptions = shuffle(options);   // 섞인 선택지

    res.json({
        question: question,             // 문제
        options: shuffledOptions,       //선택지
        correct_answer : word.word      // 정답
    });

});

module.exports = router;