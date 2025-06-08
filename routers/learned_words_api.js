const express = require("express");
const db = require("../config/db");

const router = express.Router();

// 하루 학습 단어 수
const WORDS_PER_DAY = 4;

// GET: 학습한 단어 목록 + 북마크 상태
router.get("/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    // 가입일 확인
    const [[user]] = await db.execute(
      `SELECT join_date FROM users WHERE id = ?`,
      [userId]
    );
    if (!user) {
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    }

    // 경과 일수 계산 (오늘 포함)
    const [[{ days }]] = await db.execute(
      `SELECT DATEDIFF(CURDATE(), ?) + 1 AS days`,
      [user.join_date]
    );

    // 총 학습 단어 수 계산
    const totalWords = days * WORDS_PER_DAY;

    // words + 북마크 상태 조회
    const [words] = await db.execute(
      `SELECT 
         w.id,
         w.word, 
         w.meaning, 
         w.example,
         CASE WHEN b.id IS NOT NULL THEN true ELSE false END AS bookmarked
       FROM words w
       LEFT JOIN bookmarks b 
         ON w.id = b.word_id AND b.user_id = ?
       WHERE w.id <= ?
       ORDER BY w.id`,
      [userId, totalWords]
    );

    res.status(200).json(
      words.map((word) => ({
        ...word,
        bookmarked: !!word.bookmarked, // ← 여기에서 숫자 0/1 → true/false
      }))
    );
  } catch (err) {
    console.error("learned_words_api GET 오류:", err);
    res.status(500).json({ error: "서버 내부 오류" });
  }
});

// 북마크 토글 기능
router.post("/bookmark", async (req, res) => {
  const { userId, wordId } = req.body;

  try {
    const [rows] = await db.execute(
      `SELECT * FROM bookmarks WHERE user_id = ? AND word_id = ?`,
      [userId, wordId]
    );

    if (rows.length > 0) {
      await db.execute(
        `DELETE FROM bookmarks WHERE user_id = ? AND word_id = ?`,
        [userId, wordId]
      );
      return res.json({ message: "북마크 삭제됨", bookmarked: false });
    } else {
      await db.execute(
        `INSERT INTO bookmarks (user_id, word_id) VALUES (?, ?)`,
        [userId, wordId]
      );
      return res.json({ message: "북마크 추가됨", bookmarked: true });
    }
  } catch (err) {
    console.error("북마크 토글 오류:", err);
    res.status(500).json({ error: "서버 오류" });
  }
});

module.exports = router;
