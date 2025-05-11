/* 단어 사전 api */
const express = require('express');
const Word = require('../word.json');

const router = express.Router();

// 모든 단어 반환
router.get('/word', (req, res) => {
    const words = Object.keys(Word);
    res.json(words);
});

// 단어의 뜻과 예문을 반환
router.get('/word/:word', (req, res) => {
    const { word } = req.params;
    console.log(`Requested word: ${word}`);
    const wordInfo = Word[word];
    console.log(`Word info: ${JSON.stringify(wordInfo)}`);

    if (wordInfo) {
        res.json({
            word: word,                // 단어
            meaning: wordInfo.meaning, // 뜻
            example: wordInfo.example  // 예문
        });
    } else {
        res.status(404).json({ error: '단어를 찾을 수 없습니다.' });
    }
});

// TODO : DB에 저장하는 방식으로 수정해야함
let bookmarks = [];

// 북마크 추가(POST)
router.post('/bookmarks', (req,res)=>{
    const{word} = req.body;
    
    // 중복된 단어는 북마크하지 않도록 체크
    const existingBookmark = bookmarks.find(b => b.word === word)
    if(existingBookmark){
        return res.status(400).json({error: '이미 북마크된 단어입니다.'});
    } 

    const newBookmark = {id: bookmarks.length + 1, word};
    bookmarks.push(newBookmark);
    res.status(201).json(newBookmark);
});

// 모든 북마크 조회(GET)
router.get('/bookmarks', (req,res)=>{
    res.status(200).json(bookmarks);
});

module.exports = router;