var utils = require("../utils");

var mysql = require("mysql");
var sync_mysql = require("sync-mysql");
var db_config = require("../config/db");
var connection = new sync_mysql(db_config);

module.exports = function(req, res, next) {
    var logger_caller = "/change-password(POST)";
    var logger_args = {"pw_hashed": req.body.pw_hashed, "email": req.body.email, "code": req.body.code};    

    var pw_from_client = req.body.pw_hashed;
    var email = req.body.email;
    var code = req.body.code;
    
    if(email === undefined || email.length == 0 || !utils.isEmail(email)
        || pw_from_client === undefined || pw_from_client.length != 45
        || code === undefined || code.length != 8) {
        utils.log(logger_caller, "Error - Invalid params", logger_args, "y");
        res.sendStatus(401);
        return;
    }
    
    try {
        var qresult = connection.query("SELECT " +
                                            "auth_id, user_id, email, code, created_time, verified_time " + 
                                        "FROM " +
                                            "User_Auth " + 
                                        "WHERE " + 
                                            "email=" + mysql.escape(email) + " AND " +
                                            "code=" + mysql.escape(code) + " AND " + 
                                            "is_verified=1" + " " +
                                        "ORDER BY created_time DESC " + 
                                        "LIMIT 1");

        if (qresult.length == 0) {
            utils.log(logger_caller, "Error - Invalid Auth", logger_args, "y");
            res.sendStatus(403);
            return;
        } else {
            var auth_id = qresult[0]["auth_id"];
            var user_id = qresult[0]["user_id"];
            var verified_time = new Date(qresult[0]["verified_time"]);
            var now = new Date();

            if((now - verified_time) / 1000 > 300) {
                utils.log(logger_caller, "Error - Auth Expired", logger_args, "y");
                res.sendStatus(405);
                return;
            }

            var salt = utils.createNewSalt();
            var pw_hashed = utils.hash(pw_from_client, salt);

            connection.query("UPDATE " + 
                                "User " + 
                            "SET " + 
                                "pw_hashed=" + mysql.escape(pw_hashed) + ", " +
                                "salt=" + mysql.escape(salt) + " " +
                            "WHERE " +
                                "id=" + user_id);

            connection.query("DELETE FROM " + 
                                "User_Auth " + 
                            "WHERE " +
                                "auth_id=" + auth_id);

            utils.log(logger_caller, "Success", logger_args);
            res.sendStatus(200);
            return;
        }
    } catch(e) {
        utils.log(logger_caller, "Error - " + e, logger_args, "r");
        res.sendStatus(400);
        return;
    }
}