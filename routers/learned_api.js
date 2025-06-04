// routers/learned_api.js
const express = require("express");
const db = require("../config/db");
const router = express.Router();

router.post("/", async (req, res) => {
  const { user_id, t_type, thing, learn_date } = req.body;

  if (!user_id || !t_type || !thing || !learn_date) {
    return res.status(400).json({ error: "모든 필드를 입력해주세요." });
  }

  try {
    // 사용자 존재 여부 확인
    const [userRows] = await db.query("SELECT id FROM users WHERE id = ?", [
      user_id,
    ]);

    if (userRows.length == 0) {
      return res.status(404).json({ error: "없는 사용자입니다." });
    }

    // 중복 체크
    const [existing] = await db.query(
      `SELECT * FROM user_learned WHERE user_id = ? AND t_type = ? AND thing = ? AND learn_date = ?`,
      [user_id, t_type, thing, learn_date]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "이미 저장된 학습 항목입니다." });
    }

    await db.query(
      `INSERT INTO user_learned (user_id, t_type, thing, learn_date)
       VALUES (?, ?, ?, ?)`,
      [user_id, t_type, thing, learn_date]
    );

    res.status(201).json({ message: "학습 내용 저장 완료" });
  } catch (err) {
    console.error("학습 저장 오류:", err);
    res.status(500).json({ error: "서버 오류" });
  }
});

module.exports = router;
