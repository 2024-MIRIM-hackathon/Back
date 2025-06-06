/* 퀴즈 api */
const express = require("express");
var db = require("../config/db");

const router = express.Router();

// 오늘 배운 단어 퀴즈
router.get("/today", async (req, res) => {
  const user_id = req.session.user?.id;
  console.log("세션 user_id: ", user_id);
  // console.log(req.session);

  const [words] = await db.query(
    `SELECT w.word, w.meaning, w.example
    FROM todo t JOIN words w ON w.id BETWEEN t.word_start_index AND t.word_start_index+3
    WHERE t.todo_date = CURDATE() AND t.user_id = ?`, [user_id]
  );

  if (!words || words.length === 0) {
    return res.status(404).json({ error: "오늘 학습한 단어가 없습니다." });
  }
  const randomIndex = Math.floor(Math.random() * words.length);
  const word = words[randomIndex];
  const question = words[randomIndex].meaning;

  const remainwords = words.filter((wrd) => wrd !== word);

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
  randomOptions.forEach((wrd) => {
    options.push(wrd);
  });

  options.push(word);

  const shuffle = (array) => array.sort(() => Math.random() - 0.5);
  const shuffledOptions = shuffle(options); // 섞인 선택지

  res.json({
    question: question, // 문제
    options: shuffledOptions, //선택지
    correct_answer: word.word, // 정답
  });
});

// 배웠던 단어 퀴즈
router.get("/random", async (req, res) => {
  const user_id = req.session.user?.id;
  console.log(user_id);

  const [words] = await db.query(
    `SELECT w.word, w.meaning, w.example
    FROM todo t JOIN words w ON w.id BETWEEN t.word_start_index AND t.word_start_index+3
    WHERE t.user_id = ?`, [user_id]
  );

  if (!words || words.length === 0) {
    return res.status(404).json({ error: "학습한 단어가 없습니다." });
  }
  const randomIndex = Math.floor(Math.random() * words.length);
  const word = words[randomIndex]; // 정답 단어
  const question = words[randomIndex].meaning;

  const remainwords = words.filter((wrd) => wrd !== word);

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
  randomOptions.forEach((wrd) => {
    options.push(wrd);
  });

  options.push(word);

  const shuffle = (array) => array.sort(() => Math.random() - 0.5);
  const shuffledOptions = shuffle(options); // 섞인 선택지

  res.json({
    question: question, // 문제
    options: shuffledOptions, //선택지
    correct_answer: word.word, // 정답
  });
});

router.post("/complete", async (req, res) => {
  const user_id = req.session.user?.id;

  if (!user_id) {
    return res.status(401).json({ error: "로그인이 필요합니다." });
  }

  try {
    await db.query(
      `INSERT INTO learning_status (user_id, date, quiz_learn)
      VALUES (?, CURDATE(), 1)
      ON DUPLICATE KEY UPDATE quiz_learn = 1`,
      [user_id]
    );
    res.json({ message: "퀴즈 완료 저장됨" });
  } catch (err) {
    console.error("퀴즈 완료 저장 오류:", err);
    res.status(500).json({ error: "퀴즈 완료 저장 실패" });
  }
});

module.exports = router;
