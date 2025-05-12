/* 퀴즈 api */
const express = require('express');
var db = require('../config/db');

const router = express.Router();

// 배웠던 단어 퀴즈
router.get('/randomquize', async (req, res) => {
    // DB에서 데이터 가져오기
    const [words] = await db.query(
        'SELECT w.id, w.word, w.meaning, w.example, ul.thing FROM words w, user_learned ul WHERE (ul.thing = w.word)');
    console.log("DB 데이터 : ", words);     // 데이터 구조 확인

    const randomIndex = Math.floor(Math.random() * words.length);
    const word = words[randomIndex];        // 정답 단어
    const question = words[randomIndex].meaning;

    // 정답 제외한 단어 배열
    const remainwords = words.filter(wrd => wrd !== word);

    // 정답 제외 랜덤으로 단어 3개 선택
    const randomOptions = [];
    while (randomOptions.length < 3) {
        const randIndex = Math.floor(Math.random() * remainwords.length);
        const randomWord = remainwords[randIndex];

        // 이미 선택된 단어가 아닌 경우에만 추가
        if (!randomOptions.includes(randomWord)) {
            randomOptions.push(randomWord);
        }
    }

    // 선택지 배열
    const options = [];
    randomOptions.forEach(wrd => {
        options.push(wrd);
    });

    options.push(word); // 배열에 정답을 포함

    // 선택지를 섞음
    const shuffle = (array) => array.sort(() => Math.random() - 0.5);
    const shuffledOptions = shuffle(options);   // 섞인 선택지

    res.json({
        question: question, // 문제
        options: shuffledOptions, //선택지
        correct_answer : word.word   // 정답
    });

});

module.exports = router;