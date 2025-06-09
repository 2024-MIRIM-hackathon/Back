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
    word_id : randomIndex+1,
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
    word_id : randomIndex+1,
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

// 틀린 단어 저장
router.post("/wrong_word", async (req, res) => {

  const { word_id, wrong_word } = req.body;
  const user_id = req.session.user?.id;

  try {
    const [wrong_words] = await db.query(`SELECT word_id FROM wrong_words WHERE user_id = ?`, [user_id]);
    const [right_words] = await db.query(`SELECT word_id FROM right_words WHERE user_id = ?`, [user_id]);

    // wrong_words에 저장되어있지 않은 경우에만 저장
    if (wrong_words.filter(item => item.word_id === word_id).length === 0){
      await db.query(
        `INSERT INTO wrong_words (user_id, word_id, word)
        VALUES(?, ?, ?)`, [user_id, word_id, wrong_word]
      )
    }

    // right_words에 저장되어있는 경우 삭제
    if (right_words.filter(item => item.word_id === word_id).length > 0){
      await db.query(`DELETE FROM right_words WHERE user_id = ? AND word_id = ?`, [user_id, word_id]);
    }

    res.status(200).json("틀린 단어를 저장했습니다!");

  } catch (err) {
    console.error(err);
    res.status(500).send({err: 'Database error'});
  }
});

// 맞은 단어 저장
router.post("/right_word", async (req, res) => {

  const { word_id, right_word } = req.body;
  const user_id = req.session.user?.id;

  try {
    const [wrong_words] = await db.query(`SELECT word_id FROM wrong_words WHERE user_id = ?`, [user_id]);
    const [right_words] = await db.query(`SELECT word_id FROM right_words WHERE user_id = ?`, [user_id]);

    // right_words에 저장되어있지 않은 경우에만 저장
    if (right_words.filter(item => item.word_id === word_id).length === 0){
      await db.query(
        `INSERT INTO right_words (user_id, word_id, word)
        VALUES(?, ?, ?)`, [user_id, word_id, right_word]
      )
    } 

    // wrong_words에 저장되어있는 단어인 경우 wrong_words에서 삭제
    if (wrong_words.filter(item => item.word_id === word_id).length > 0){
      await db.query(`DELETE FROM wrong_words WHERE user_id = ? AND word_id = ?`, [user_id, word_id]);
    }

    res.status(200).json("맞은 단어를 저장했습니다!");

  } catch (err) {
    console.error(err);
    res.status(500).send({err: 'Database error'});
  }
});

// 사용자들이 틀린 단어
router.get("/peoples_wrong_word", async (req, res) => {

  try {
    const wrong_word = await db.query(
      `SELECT DISTINCT words.*
      FROM wrong_words JOIN words ON wrong_words.word_id = words.id;`
    )
    const wrong_word_list = wrong_word[0]
    res.status(200).json(wrong_word_list);

  } catch (err) {
    console.error(err);
    res.status(500).send({err: 'Database error'});
  }
});

module.exports = router;
