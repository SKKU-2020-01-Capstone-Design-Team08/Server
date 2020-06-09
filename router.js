var express = require("express");
var router = express.Router();

router.post("/login", require("./controllers/login"));

router.post("/signup", require("./controllers/signup"));

router.get("/forgot-password", require("./controllers/forgot-password"));

router.get("/verify-code", require("./controllers/verify-code"));

router.post("/change-password", require("./controllers/change-password"));

router.post("/add-pet", require("./controllers/add-pet"));

router.use("/upload-img", require("./controllers/upload-img"));

router.get("/download-img", require("./controllers/download-img"));

router.post("/test", require("./controllers/test"));

module.exports = router;
