const express = require("express");
const session = require("express-session");
const cors = require("cors");
const app = express();

// 라우터 설정
const Quize = require("./routers/quiz_api");
const User = require("./routers/user_api");
const dailyLearn = require("./routers/daily_learn_api");
const dateRouter = require("./routers/calendar_api");
const learned = require("./routers/learned_api");
const wordRouter = require("./routers/word");
const MyPage = require("./routers/mypage_api");

app.set("port", process.env.PORT || 5000);
app.use(
  cors({
    credentials: true,
  })
);
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
    },
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 라우터 불러오기
app.use("/api/quiz", Quize);
app.use("/api/user", User);
app.use("/api/daily", dailyLearn);
app.use("/api/date", dateRouter);
app.use("/api/learned", learned);
app.use("/api", wordRouter);
app.use("/api/mypage", MyPage);

// 기본 라우트 설정
app.get("/", (req, res) => {
  res.send("2024-MITHON");
});

// 서버 실행
const port = app.get("port");
app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});
