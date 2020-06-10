var utils = require("../utils");

var mysql = require("mysql");
var sync_mysql = require("sync-mysql");
var db_config = require("../config/db");
var connection = new sync_mysql(db_config);

var fs = require("fs");

module.exports = function (req, res, next) {
    var logger_caller = "/download-img(GET)";
    var logger_args = { "user_id": req.query.user_id, "pet_id": req.query.pet_id, "photo_id": req.query.photo_id, "token": req.headers["x-access-token"] };

    var user_id = req.query.user_id;
    var pet_id = req.query.pet_id;
    var photo_id = req.query.photo_id;
    var token = req.headers["x-access-token"];
    
    if(user_id === undefined || user_id.length == 0
        || pet_id === undefined || pet_id.length == 0
        || photo_id === undefined || photo_id.length == 0) {
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
        var qresult = connection.query("SELECT " + 
                                            "path " +
                                        "FROM " +
                                            "Photo " + 
                                        "WHERE " +
                                            "photo_id=" + mysql.escape(photo_id) + " AND " +
                                            "user_id=" + mysql.escape(user_id) + " AND " + 
                                            "pet_id=" + mysql.escape(pet_id) + " " +
                                        "ORDER BY photo_id DESC LIMIT 1");
        
        if(qresult.length == 0) {
            utils.log(logger_caller, "Error - Invalid params", logger_args, "y");
            res.sendStatus(401);
            return;
        }

        var path = qresult[0]["path"];
        
        res.setHeader("Content-type", "image/jpg");
        res.setHeader("Content-disposition", "attachment; filename=" + photo_id + ".jpg");
        fs.createReadStream(path).pipe(res);
        utils.log(logger_caller, "Success", logger_args);
        return;
    } catch(e) {
        utils.log(logger_caller, "Error - " + e, logger_args, "r");
        res.sendStatus(400);
        return;
    }
}