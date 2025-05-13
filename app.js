const express = require('express');
const session = require('express-session');
const app = express();

// 라우터 설정
const WordDictionary = require('./routers/word_dictionary_api');
const Quize = require('./routers/quiz_api');
const User = require('./routers/user_api');

app.set('port', process.env.PORT || 5000);
app.use(session({
    secret: process.env.COOKIE_SECRE,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false
    }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// 라우터 불러오기
app.use('/api/worddictionary', WordDictionary);
app.use('/api/quize', Quize);
app.use('/api/user', User);

// 기본 라우트 설정
app.get('/', (req, res) => {
   res.send('2024-MITHON');
});

// 서버 실행
const port = app.get('port');
app.listen(port, () => {
    console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});
