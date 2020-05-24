var express = require("express");
var router = express.Router();

var utils = require("../utils");

var mysql = require("mysql");
var sync_mysql = require("sync-mysql");
var db_config = require("../config/db");
var connection = new sync_mysql(db_config);

var nodemailer = require("nodemailer");
var nodemailer_config = require("../config/nodemailer");
var transporter = nodemailer.createTransport(nodemailer_config);

router.post("/login", function(req, res, next) {
    var logger_caller = "/user/login(POST)";
    var logger_args = {"email": req.body.email, "pw_hashed": req.body.pw_hashed};

    var email = req.body.email;
    var pw_from_client = req.body.pw_hashed;

    if(email === undefined || email.length == 0 || !utils.isEmail(email) || pw_from_client === undefined) {
        utils.log(logger_caller, "Error - Invalid params", logger_args, "y");
        res.sendStatus(400);
        return;
    }

    try {
        var qresult = connection.query("SELECT " +
                                            "id, pw_hashed, salt " +
                                        "FROM " + 
                                            "User " + 
                                        "WHERE " + 
                                            "email=" + mysql.escape(email));

        if(qresult.length == 0) {
            utils.log(logger_caller, "Error - No such email", logger_args, "y");
            res.sendStatus(400);
            return;
        }

        if(qresult[0]["pw_hashed"] != utils.hash(pw_from_client, qresult[0]["salt"])) {
            utils.log(logger_caller, "Error - pw_hashed not matching", logger_args, "y");
            res.sendStatus(400);
            return;
        }

        req.session.user = {
            "id": qresult[0]["id"],
            "email": email
        };
        utils.log(logger_caller, "Success", logger_args);
        res.sendStatus(200);
        return;
    } catch(e) {
        //throw e;
        utils.log(logger_caller, "Error - " + e, logger_args, "r");
        res.sendStatus(500);
        return;
    }
});

router.post("/signup", function(req, res, next) {
    var logger_caller = "/user/signup(POST)";
    var logger_args = {"first_name": req.body.first_name, "last_name": req.body.last_name, "email": req.body.email, "phone_number": req.body.phone_number, "pw_hashed": req.body.pw_hashed};

    var first_name = req.body.first_name;
    var last_name = req.body.last_name;
    var email = req.body.email;
    var phone_number = req.body.phone_number;
    var pw_from_client = req.body.pw_hashed;

    var salt = utils.createNewSalt();

    try {
        connection.query("INSERT INTO " + 
                            "User(email, pw_hashed, salt, first_name, last_name, phone_number, pet_num) " +
                        "VALUES (" +
                            mysql.escape(email) + ", " + 
                            mysql.escape(utils.hash(pw_from_client, salt)) + ", " + 
                            mysql.escape(salt) + ", " + 
                            mysql.escape(first_name) + ", " + 
                            mysql.escape(last_name) + ", " + 
                            mysql.escape(phone_number) + ", " + 
                            "0)");

        utils.log(logger_caller, "Success", logger_args);
        res.sendStatus(200);
        return;
    }  catch(e) {
        utils.log(logger_caller, "Error - " + e, logger_args, "y")
        res.sendStatus(400);
        return;
    }
});

router.get("/forgot-password", function(req, res, next) {
    var logger_caller = "/user/forgot-password(GET)";
    var logger_args = {"email": req.query.email};
    
    var email = req.query.email;

    if(email === undefined || email.length == 0 || !utils.isEmail(email)) {
        utils.log(logger_caller, "Error - Invalid params", logger_args, "y");
        res.sendStatus(400);
        return;
    }

    try {
        var qresult = connection.query("SELECT id FROM User WHERE email=" + mysql.escape(email));

        if(qresult.length == 0) {
            utils.log(logger_caller, "Error - No such email", logger_args, "y");
            res.sendStatus(400);
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
                if(err) throw err;

                utils.log(logger_caller, "Success", logger_args);

                res.sendStatus(200);
            });

            return;
        }
    } catch(e) {
        //throw e;
        utils.log(logger_caller, "Error - " + e, logger_args);
        res.sendStatus(500);
        return;
    }
});

router.get("/verify-code", function(req, res, next) {
    var logger_caller = "/user/verify-code(GET)";
    var logger_args = {"email": req.query.email, "code": req.query.code};

    var email = req.query.email;
    var code = req.query.code;

    if(email === undefined || email.length == 0 || !utils.isEmail(email) || code.length != 8) {
        utils.log(logger_caller, "Error - Invalid params", logger_args, "y");
        res.sendStatus(400);
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
            res.sendStatus(400);
            return;
        } else {
            var auth_id = qresult[0]["auth_id"];
            var created_time = new Date(qresult[0]["created_time"]);
            var now = new Date();
            
            if ((now - created_time) / 1000 > 300) {
                utils.log(logger_caller, "Error - Code Expired", logger_args, "y");
                res.sendStatus(401);
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
});

router.post("/change-password", function(req, res, next) {
    var logger_caller = "/user/change-password(POST)";
    var logger_args = {"pw_hashed": req.body.pw_hashed, "email": req.body.email, "code": req.body.code};    

    var pw_from_client = req.body.pw_hashed;
    var email = req.body.email;
    var code = req.body.code;

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
            res.sendStatus(400);
            return;
        } else {
            var auth_id = qresult[0]["auth_id"];
            var user_id = qresult[0]["user_id"];
            var verified_time = new Date(qresult[0]["verified_time"]);
            var now = new Date();

            if((now - verified_time) / 1000 > 300) {
                utils.log(logger_caller, "Error - Auth Expired", logger_args, "y");
                res.sendStatus(400);
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
});

module.exports = router;

