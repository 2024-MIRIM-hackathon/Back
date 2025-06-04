/* 북마크 api */
const express = require("express");
const db = require("../../config/db");

const router = express.Router();

// 북마크 추가/삭제
router.post("/", async (req, res) => {
  const { userId, wordId } = req.body;

  try {
    const [rows] = await db.query(
      "SELECT * FROM bookmarks WHERE user_id = ? AND word_id = ?",
      [userId, wordId]
    );

    if (rows.length > 0) {
      await db.query(
        "DELETE FROM bookmarks WHERE user_id = ? AND word_id = ?",
        [userId, wordId]
      );
      res.status(200).json({ message: "북마크 삭제", userId, wordId });
    } else {
      await db.query("INSERT INTO bookmarks (user_id, word_id) VALUES (?, ?)", [
        userId,
        wordId,
      ]);
      res.status(200).json({ message: "북마크 추가", userId, wordId });
    }
  } catch (err) {
    console.error("북마크 토글 오류 :", err);
    res.status(500).json({ error: "서버 오류" });
  }
});

// 사용자 북마크 목록 조회
router.get("/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const [rows] = await db.query(
      `SELECT w.word, w.meaning, w.example FROM bookmarks b
      JOIN words w ON b.word_id = w.id
      WHERE b.user_id = ?`,
      [userId]
    );
    res.status(200).json({ bookmarks: rows });
  } catch (err) {
    console.error("북마크 조회 오류 : ", err);
    res.status(500).json({ error: "서버 오류" });
  }
});

module.exports = router;
