var utils = require("../utils");

var mysql = require("mysql");
var sync_mysql = require("sync-mysql");
var db_config = require("../config/db");
var connection = new sync_mysql(db_config);

module.exports = function(req, res, next) {
    var logger_caller = "/signup(POST)";
    var logger_args = {"first_name": req.body.first_name, "last_name": req.body.last_name, "email": req.body.email, "phone_number": req.body.phone_number, "pw_hashed": req.body.pw_hashed};

    var first_name = req.body.first_name;
    var last_name = req.body.last_name;
    var email = req.body.email;
    var phone_number = req.body.phone_number;
    var pw_from_client = req.body.pw_hashed;

    if(first_name === undefined || first_name.length == 0
        || last_name === undefined || last_name.length == 0
        || email === undefined || email.length == 0 || !utils.isEmail(email)
        || phone_number === undefined || phone_number.length == 0
        || pw_from_client === undefined || pw_from_client.length != 45) {
        utils.log(logger_caller, "Error - Invalid params", logger_args, "y");
        res.sendStatus(401);
        return;
    }

    var salt = utils.createNewSalt();

    try {
        connection.query("INSERT INTO " + 
                            "User(email, pw_hashed, salt, first_name, last_name, phone_number) " +
                        "VALUES (" +
                            mysql.escape(email) + ", " + 
                            mysql.escape(utils.hash(pw_from_client, salt)) + ", " + 
                            mysql.escape(salt) + ", " + 
                            mysql.escape(first_name) + ", " + 
                            mysql.escape(last_name) + ", " + 
                            mysql.escape(phone_number) + ")");

        utils.log(logger_caller, "Success", logger_args);
        res.sendStatus(200);
        return;
    }  catch(e) {
        utils.log(logger_caller, "Error - " + e, logger_args, "y")
        res.sendStatus(400);
        return;
    }
}