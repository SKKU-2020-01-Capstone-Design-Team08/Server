var express = require("express");
var router = express.Router();

var utils = require("../utils");

var multer = require("multer");
var upload = multer({
    dest: "./photos"
});

var mysql = require("mysql");
var sync_mysql = require("sync-mysql");
var db_config = require("../config/db");
var connection = new sync_mysql(db_config);

router.post("/", upload.single("photo"), function(req, res, next) {
    var logger_caller = "/upload-img(POST)";
    var logger_args = { "user_id": req.body.user_id, "pet_id": pet_id, "photo.size": req.file.size, "token": req.headers["x-access-token"] };

    var user_id = req.body.user_id;
    var pet_id = req.body.pet_id;
    var photo = req.file;
    var token = req.headers["x-access-token"];

    if(user_id === undefined || user_id.length == 0
        || pet_id === undefined || pet_id.length == 0
        || photo === undefined) {
        utils.log(logger_caller, "Error - Invalid params", logger_args, "y");
        res.sendStatus(401);
        return;
    }

    var token_verification_result = utils.verifyToken(token, user_id);
    if(token_verification_result == utils.ERROR_EXPIRED_TOKEN) {
        utils.log(logger_caller, "Error - Token expired", logger_args, "y");
        res.sendStatus(405);
        return;
    } else if (token_verification_result == utils.ERROR_INVALID_TOKEN) {
        utils.log(logger_caller, "Error - Invalid token", logger_args, "y");
        res.sendStatus(403);
        return;
    }

    try {
        connection.query("INSERT INTO " + 
                            "Photo(user_id, pet_id, path) " + 
                        "VALUES (" + 
                            mysql.escape(user_id) + ", " + 
                            mysql.escape(pet_id) + ", " + 
                            mysql.escape(photo.path) + ")");
        
        var qresult = connection.query("SELECT LAST_INSERT_ID() as photo_id");
        var photo_id = qresult[0]["photo_id"];

        connection.query("UPDATE Pet SET photo_id=" + mysql.escape(photo_id) + " WHERE pet_id=" + mysql.escape(pet_id));

        utils.log(logger_caller, "Success", logger_args);

        res.status(200).json({
            "photo_id": photo_id
        });
    } catch(e) {
        utils.log(logger_caller, "Error - " + e, logger_args, "r");
        res.sendStatus(400);
    }
});

module.exports = router;