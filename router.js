var express = require("express");
var router = express.Router();

router.use("/user", require("./routers/user"));
router.use("/test", require("./routers/test"));

module.exports = router;
