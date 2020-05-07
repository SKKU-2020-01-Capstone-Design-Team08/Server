var express = require("express");
var router = express.Router();

var utils = require("../utils");
var mysql = require("mysql");
var sync_mysql = require("sync-mysql");
var dbconfig = require("../config/db");
var connection = new sync_mysql(dbconfig);

router.get("/salt", function(req, res, next) {
    var logger_caller = "/user/salt";
    var logger_args = {"email": req.query.email};
    
    var email = req.query.email;

    if(email === undefined || email.length == 0 || !isEmail(email)) {
        utils.log(logger_caller, "Error - Invalid params", logger_args, "y");
        res.sendStatus(400);
        return;
    }

    try {
        var qresult = connection.query("SELECT salt FROM User WHERE email=" + mysql.escape(email));

        if(qresult.length == 0) {
            utils.log(logger_caller, "Error - No such email", logger_args, "y");
            res.sendStatus(400);
            return;
        } else {
            utils.log(logger_caller, "Success", logger_args);
            res.status(200).json({"salt": qresult[0]["salt"]});
            return;
        }
    } catch(e) {
        //throw e;
        utils.log(logger_caller, "Error - DB Connection Error", logger_args);
        res.sendStatus(500);
        return;
    }
});

router.post("/login", function(req, res, next) {
    var logger_caller = "/user/login(POST)";
    var logger_args = {"email": req.body.email, "pw_hashed": req.body.pw_hashed};

    var email = req.body.email;
    var pw_hashed = req.body.pw_hashed;

    if(email === undefined || email.length == 0 || !isEmail(email) || pw_hashed === undefined || pw_hashed.length != 64) {
        utils.log(logger_caller, "Error - Invalid params", logger_args, "y");
        res.sendStatus(400);
        return;
    }

    try {
        var qresult = connection.query("SELECT id, pw_hashed FROM User WHERE email=" + mysql.escape(email));

        if(qresult.length == 0) {
            utils.log(logger_caller, "Error - No such email", logger_args, "y");
            res.sendStatus(400);
            return;
        }

        if(qresult[0]["pw_hashed"] != pw_hashed) {
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
        utils.log(logger_caller, "Error - DB Connection Error", logger_args);
        res.sendStatus(500);
        return;
    }
});

module.exports = router;

function isEmail(string) {
    var email_regExp = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;
    return email_regExp.test(string);
}