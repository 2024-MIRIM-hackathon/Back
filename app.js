const express = require('express');
const app = express();

app.use(express.json());
app.set('port', process.env.PORT || 5000);

// 라우터 설정
const WordDictionary = require('./routers/word_dictionary_api');
const Quize = require('./routers/quiz_api');

// 라우터 불러오기
app.use('/api/worddictionary', WordDictionary);
app.use('/api/quize', Quize);

// 기본 라우트 설정
app.get('/', (req, res) => {
   res.send('2024-MITHON');
});

// 서버 실행
const port = app.get('port');
app.listen(port, () => {
    console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});
