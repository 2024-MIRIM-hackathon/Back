/* 퀴즈 api */
const express = require('express');
const Word = require('../word.json');

const router = express.Router();

// 퀴즈 문제와 선택지 4개를 반환
router.get('/randomquize', (req, res) => {
    // TODO : 랜덤으로 특정 단어를 지정하고 그 뜻을 문제로 냄
    const words = Object.keys(Word);
    const randomIndex = Math.floor(Math.random() * words.length);
    const word = words[randomIndex];    // 랜덤으로 정답 단어 지정
    const question = Word[word].meaning;

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
        result : word   // 정답
    });

});

module.exports = router;