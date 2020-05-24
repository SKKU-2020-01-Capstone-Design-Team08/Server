var express = require("express");
var router = express.Router();

var utils = require("../utils");
var mysql = require("mysql");
var sync_mysql = require("sync-mysql");
var dbconfig = require("../config/db");
var connection = new sync_mysql(dbconfig);

router.post("/", function(req, res, next) {
    var logger_caller = "/test(POST)";
    var logger_args = {"pet_id": req.body.petId};

    utils.log(logger_caller, "Success", logger_args);

    var pet_id = req.body.petId;

    res.status(200).json({
        "msg": "data received : " + pet_id
    });
});

module.exports = router;