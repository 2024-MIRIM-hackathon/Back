/* 단어 api */
const express = require("express");
const db = require("../../config/db");

const router = express.Router();

// 모든 단어 반환
router.get("/", async (req, res) => {
  const sql = "SELECT id, word, meaning, example FROM words";

  try {
    const [rows] = await db.query(sql); // rows : 쿼리 결과로 나온 데이터(각 행) 목록.
    res.status(200).json(rows);
  } catch (err) {
    console.error("단어 목록 조회 오류 : ", err);
    return res.status(500).json({ error: "서버 오류" });
  }
});

module.exports = router;
