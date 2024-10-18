const express = require('express');
const app = express();
const PORT = process.env.PORT || 7099;
const cors = require('cors');


app.use(express.json());
app.use(cors())

// 기본 라우트 설정
app.get('/', (req, res) => {
   res.send('2024-MITHON');
});

const w = require('./ages.json')

// 나이에 따른 단어 반환
app.get('/age/:age', (req, res)=>{
  const{age} = req.params
  const word = w.words[`${age}대`]

  if(word){
    console.log(`나이대: ${age}대, 단어: ${word}`)
    res.json({'age':`${age}대`, 'word':word})
  }
  else {
    res.status(404).json({ error: '해당 나이대의 단어를 찾을 수 없습니다.' });
    }
});

const wordData = require('./word.json');

// 모든 단어 반환
app.get('/myword', (req, res) => {
    const words = Object.keys(wordData);
    res.json(words);
});

// 단어의 뜻과 예문을 반환
app.get('/myword/:word', (req, res) => {
    const { word } = req.params;
    console.log(`Requested word: ${word}`);
    const wordInfo = wordData[word];
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

// 북마크 저장을 위한 배열
let bookmarks = []

// 북마크 추가(POST)
app.post('/bookmarks', (req,res)=>{
    const{word} = req.body
    
    // 중복된 단어는 북마크하지 않도록 체크
    const existingBookmark = bookmarks.find(b => b.word === word)
    if(existingBookmark){
        return res.status(400).json({error: '이미 북마크된 단어입니다.'})
    } 

    const newBookmark = {id: bookmarks.length + 1, word}
    bookmarks.push(newBookmark)
    console.log(bookmarks)
    res.status(201).json(newBookmark)
})

// 모든 북마크 조회(GET)
app.get('/bookmarks', (req,res)=>{
    res.status(200).json(bookmarks)
})

function getQuize() {
    const apiUrl = "http://172.16.21.53:7099/quize"
    fetch(apiUrl)
    .then(response => response.json())
}

// 퀴즈 문제와 선택지 4개를 반환
app.get('/quize', (req, res) => {
    // TODO : 랜덤으로 특정 단어를 지정하고 그 뜻을 문제로 냄
    const words = Object.keys(wordData);
    const randomIndex = Math.floor(Math.random() * words.length);
    const word = words[randomIndex];    // 랜덤으로 정답 단어 지정
    const question = wordData[word].meaning;

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
        result: word //정답
    });

});


// 서버 시작
app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
