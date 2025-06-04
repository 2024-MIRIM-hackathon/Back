const express = require("express");
const wordRouter = require("./words_api");
const bookmarkRouter = require("./bookmarks_api");

const router = express.Router();

router.use("/words", wordRouter);
router.use("/bookmarks", bookmarkRouter);

module.exports = router;
