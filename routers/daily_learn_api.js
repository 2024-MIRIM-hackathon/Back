// routers/daily_learn_api.js
const express = require("express");
const db = require("../config/db");
const router = express.Router();

router.get("/todays", async (req, res) => {
  const { user_id, date } = req.query;

  if (!user_id || !date) {
    return res.status(400).json({ error: "user_id와 date는 필수입니다." });
  }

  try {
    // 1. todo에서 해당 날짜의 시작 인덱스 가져오기
    let [todoRows] = await db.query(
      `SELECT word_start_index, text_start_index FROM todo WHERE user_id = ? AND todo_date = ?`,
      [user_id, date]
    );

    if (todoRows.length === 0) {
      console.log(
        `todo 없음: user_id=${user_id}, date=${date}. 자동 생성 시도.`
      );

      // user 테이블에서 join_date 가져오기
      const [userRows] = await db.query(
        `SELECT join_date FROM users WHERE id = ?`,
        [user_id]
      );

      if (userRows.length === 0) {
        return res
          .status(404)
          .json({ error: "해당 사용자를 찾을 수 없습니다." });
      }

      const joinDate = new Date(userRows[0].join_date);
      const reqDate = new Date(date);

      console.log("joinDate:", joinDate);
      console.log("reqDate:", reqDate);

      if (isNaN(joinDate) || isNaN(reqDate)) {
        console.error("날짜 변환 실패", { joinDate, reqDate });
        return res.status(500).json({ error: "날짜 변환 오류" });
      }

      if (reqDate < joinDate) {
        return res
          .status(400)
          .json({ error: "요청 날짜가 가입 날짜 이전입니다." });
      }

      // word_start_index와 text_start_index 계산 (예: 하루 4개, 하루 1개)
      const daysDiff = Math.floor((reqDate - joinDate) / (1000 * 60 * 60 * 24));
      const wordStartIndex = 1 + daysDiff * 4;
      const textStartIndex = 1 + daysDiff;

      // todo 삽입
      await db.query(
        `INSERT INTO todo (user_id, todo_date, word_start_index, text_start_index) VALUES (?, ?, ?, ?)`,
        [user_id, date, wordStartIndex, textStartIndex]
      );

      // 다시 조회
      [todoRows] = await db.query(
        `SELECT word_start_index, text_start_index FROM todo WHERE user_id = ? AND todo_date = ?`,
        [user_id, date]
      );
      // console.log("todoRows:", todoRows);
    }

    const wordStartIndex = todoRows[0].word_start_index;
    const textStartIndex = todoRows[0].text_start_index;

    // 2. 단어 4개 조회
    const [words] = await db.query(
      `SELECT id, word, meaning, example, first_example, last_example, title, writer
       FROM words
       ORDER BY id
       LIMIT 4 OFFSET ?`,
      [wordStartIndex - 1]
    );

    // 3. 텍스트 1개 조회
    const [text] = await db.query(
      `SELECT id, text, title, writer FROM texts LIMIT 1 OFFSET ?`,
      [textStartIndex - 1]
    );

    if (!text[0]) {
      return res.status(404).json({ error: "텍스트를 찾을 수 없습니다." });
    }
    res.json({ date, words, text: text[0] });
  } catch (err) {
    console.error("학습 데이터 조회 에러:", err);
    res.status(500).json({ error: "서버 내부 오류" });
  }
});

module.exports = router;
