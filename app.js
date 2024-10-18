const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// 기본 라우트 설정
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

const w = require('./ages.json')

app.get('/age/:age', (req, res)=>{
  const{age} = req.params
  const word = w.words[`${age}대`]

  if(word){
    console.log(`나이대: ${age}대, 단어: ${word}`)
    res.json({'age':`${age}대`, 'word':word})
  }
})

const w = require('./word.json');

// 모든 단어 반환
app.get('/myword', (req, res) => {
    const words = Object.keys(w);
    res.json(words);
});

// 단어의 뜻과 예문을 반환
app.get('/myword/:word', (req, res) => {
    const { word } = req.params;
    console.log(`Requested word: ${word}`);
    const wordInfo = w[word];
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

// 서버 시작
app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
