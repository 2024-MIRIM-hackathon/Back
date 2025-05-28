/* 캘린더 api */
const express = require("express");
const db = require("../config/db");

const router = express.Router();
router.get("/", async (req, res) => {
  const { user_id, date } = req.query;

  if (!user_id || !date) {
    return res.status(400).json({ error: "user_id and date are required" });
  }

  try {
    const [todoRows] = await db.query(
      `SELECT word_start_index FROM todo WHERE user_id = ? AND todo_date = ?`,
      [user_id, date]
    );

    if (todoRows.length === 0) {
      return res.status(404).json({ error: "No todo found for this date" });
    }

    const startIndex = todoRows[0].word_start_index;

    const [words] = await db.query(
      `SELECT id, word, meaning, example, first_example, last_example, title, writer
      FROM words ORDER BY id LIMIT 4 OFFSET ?`,
      [startIndex - 1]
    );

    const [text] = await db.query(
      `SELECT text, title, writer FROM texts LIMIT 1 OFFSET ?`,
      [startIndex - 1]
    );

    if (!text[0]) return res.status(404).json({ error: "No text found" });

    res.json({
      date,
      words,
      text: text[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;

// http://localhost:5000/api/date?user_id=14&date=2025-05-15
// id와 학습 날짜를 검색히면 그날의 단어와 글이 나온다. 이제는 학습 진행도를 넣으면된다!
