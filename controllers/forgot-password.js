var utils = require("../utils");

var mysql = require("mysql");
var sync_mysql = require("sync-mysql");
var db_config = require("../config/db");
var connection = new sync_mysql(db_config);

var nodemailer = require("nodemailer");
var nodemailer_config = require("../config/nodemailer");
var transporter = nodemailer.createTransport(nodemailer_config);

module.exports = function(req, res, next) {
    var logger_caller = "/forgot-password(GET)";
    var logger_args = {"email": req.query.email};
    
    var email = req.query.email;

    if(email === undefined || email.length == 0 || !utils.isEmail(email)) {
        utils.log(logger_caller, "Error - Invalid params", logger_args, "y");
        res.sendStatus(401);
        return;
    }

    try {
        var qresult = connection.query("SELECT id FROM User WHERE email=" + mysql.escape(email));

        if(qresult.length == 0) {
            utils.log(logger_caller, "Error - No such email", logger_args, "y");
            res.sendStatus(401);
            return;
        } else {
            var user_id = qresult[0]["id"];
            var now = new Date();
            var code = utils.createNewCode();

            connection.query("INSERT INTO " +
                                "User_Auth(user_id, email, code, created_time, is_verified) " +
                            "VALUES (" +
                                user_id + ", " + 
                                mysql.escape(email) + ", " + 
                                mysql.escape(code) + ", " +
                                mysql.escape(now) + ", " +
                                "0)");
            
            // Send Email
            var mail = {
                "from": nodemailer_config.auth.user,
                "to": email,
                "subject": "[Snoot] Forgot Password",
                "html": "<p style='margin-bottom: 10px;'>Enter the code below to reset the password</p><pre style='background-color: #eeeeee;'>" + code + "</pre>"
            };

            transporter.sendMail(mail, function(err, info) {
                if(err) {
                    utils.log(logger_caller, "Failed to send Email", logger_args, "r");
                }

                utils.log(logger_caller, "Success", logger_args);

                res.sendStatus(200);
            });

            return;
        }
    } catch(e) {
        utils.log(logger_caller, "Error - " + e, logger_args, "r");
        res.sendStatus(400);
        return;
    }
}