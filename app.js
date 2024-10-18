const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// 기본 라우트 설정
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

const w = require('./word.json');

// 모든 단어 반환
app.get('/myword', (req, res) => {
    const words = Object.keys(w);
    res.json(words);
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});