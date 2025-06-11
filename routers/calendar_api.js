/* 캘린더 api */
const express = require("express");
const db = require("../config/db");

const router = express.Router();
router.get("/", async (req, res) => {
  const { user_id, date } = req.query;

  if (!user_id || !date) {
    return res.status(400).json({ error: "user_id 와 date가 필요합니다." });
  }

  try {
    const [todoRows] = await db.query(
      `SELECT word_start_index FROM todo WHERE user_id = ? AND todo_date = ?`,
      [user_id, date]
    );

    if (todoRows.length === 0) {
      return res
        .status(404)
        .json({ error: "해당 날짜에는 학습 기록이 없습니다." });
    }

    const startIndex = todoRows[0].word_start_index;

    // 학습할 단어 조회
    const [words] = await db.query(
      `SELECT id, word, meaning, example, first_example, last_example, title, writer
      FROM words ORDER BY id LIMIT 4 OFFSET ?`,
      [startIndex - 1]
    );

    // 학습할 글 조회
    const [text] = await db.query(
      `SELECT text, title, writer FROM texts LIMIT 1 OFFSET ?`,
      [startIndex - 1]
    );

    if (!text[0]) {
      return res.status(404).json({ error: "글을 찾을 수 없습니다." });
    }

    // 진행도 계산
    // 단어 학습 수
    const [wordResult] = await db.query(
      `SELECT COUNT(*) AS word_count
      FROM user_learned
      WHERE user_id = ? AND learn_date = ? AND t_type = 'word'`,
      [user_id, date]
    );
    const word_count = wordResult[0].word_count;

    // 글 학습 여부
    const [textResult] = await db.query(
      `SELECT COUNT(*) AS read_done
      FROM user_learned
      WHERE user_id = ? AND learn_date = ? AND t_type = 'text'`,
      [user_id, date]
    );
    const read_done = textResult[0].read_done > 0 ? 1 : 0;

    // 퀴즈 학습 여부
    const [quizResult] = await db.query(
      `SELECT quiz_learn FROM learning_status WHERE user_id = ? AND date = ?`,
      [user_id, date]
    );
    let quiz_done = 1;
    if (
      !quizResult ||
      quizResult.length === 0 ||
      quizResult[0].quiz_learn == null
    ) {
      quiz_done = 0;
    }
    // const quiz_done = quizResult[0].quiz_learn === 1 ? 1 : 0;

    // 응답
    res.json({
      date,
      words,
      text: text[0],
      status: {
        word_count,
        read_done,
        quiz_done,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "내부 서버 오류" });
  }
});

module.exports = router;

// http://localhost:5000/api/date?user_id=14&date=2025-05-15
// id와 학습 날짜를 검색히면 그날의 단어와 글이 나온다. 이제는 학습 진행도를 넣으면된다!
