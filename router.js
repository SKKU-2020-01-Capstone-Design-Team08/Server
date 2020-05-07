var express = require("express");
var router = express.Router();

router.use("/user", require("./routers/user"));

module.exports = router;
