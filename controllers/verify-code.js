var utils = require("../utils");

var mysql = require("mysql");
var sync_mysql = require("sync-mysql");
var db_config = require("../config/db");
var connection = new sync_mysql(db_config);

module.exports = function(req, res, next) {
    var logger_caller = "/verify-code(GET)";
    var logger_args = {"email": req.query.email, "code": req.query.code};

    var email = req.query.email;
    var code = req.query.code;

    if(email === undefined || email.length == 0 || !utils.isEmail(email)
        || code === undefined || code.length != 8) {
        utils.log(logger_caller, "Error - Invalid params", logger_args, "y");
        res.sendStatus(401);
        return;
    }

    try {
        var qresult = connection.query("SELECT " +
                                            "auth_id, email, code, created_time, verified_time " + 
                                        "FROM " +
                                            "User_Auth " + 
                                        "WHERE " + 
                                            "email=" + mysql.escape(email) + " AND " +
                                            "code=" + mysql.escape(code) + " AND " + 
                                            "is_verified=0" + " " +
                                        "ORDER BY created_time DESC " + 
                                        "LIMIT 1");

        if(qresult.length == 0) {
            utils.log(logger_caller, "Error - Wrong Auth Info", logger_args, "y");
            res.sendStatus(403);
            return;
        } else {
            var auth_id = qresult[0]["auth_id"];
            var created_time = new Date(qresult[0]["created_time"]);
            var now = new Date();
            
            if ((now - created_time) / 1000 > 300) {
                utils.log(logger_caller, "Error - Code Expired", logger_args, "y");
                res.sendStatus(405);
                return;
            }
            
            connection.query("UPDATE " + 
                                "User_Auth " + 
                            "SET " + 
                                "verified_time=" + mysql.escape(now) + ", " +
                                "is_verified=1 " +
                            "WHERE " +
                                "auth_id=" + auth_id);

            utils.log(logger_caller, "Success", logger_args);
            res.sendStatus(200);
            return;
        }
    } catch(e) {
        utils.log(Logger_caller, "Error - " + e, logger_args, "r");
        res.sendStatus(400);
        return;
    }
}