var utils = require("../utils");

var mysql = require("mysql");
var sync_mysql = require("sync-mysql");
var db_config = require("../config/db");
var connection = new sync_mysql(db_config);

module.exports = function (req, res, next) {
    var logger_caller = "/add-pet(POST)";
    var logger_args = { "user_id": req.body.user_id, "email": req.body.email, "name": req.body.name, "species": req.body.species, "description": req.body.description, "arduino_mac": req.body.arduino_mac, "pi_mac": req.body.pi_mac, "token": req.headers["x-access-token"] };

    var token = req.headers["x-access-token"];
    var user_id = req.body.user_id;
    var email = req.body.email;
    var name = req.body.name;
    var species = req.body.species;
    var description = req.body.description;
    var arduino_mac = req.body.arduino_mac;
    var pi_mac = req.body.pi_mac;
    

    if(!token) {
        utils.log(logger_caller, "Error - Invalid token", logger_args, "y");
        res.sendStatus(403);
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

    if(user_id === undefined || user_id.length == 0
        || email === undefined || email.length == 0 || !utils.isEmail(email)
        || name === undefined || name.length == 0
        || species === undefined || species.length == 0
        || arduino_mac === undefined || arduino_mac.length != 17
        || pi_mac === undefined || pi_mac.length != 17) {
        utils.log(logger_caller, "Error - Invalid params", logger_args, "y");
        res.sendStatus(401);
        return;
    }

    try {
        var qresult;
        qresult = connection.query("SELECT email FROM User WHERE id=" + mysql.escape(user_id));
        if(qresult.length == 0) {
            utils.log(logger_caller, "Error - Invalid params", logger_args, "y");
            res.sendStatus(401);
            return;
        }

        connection.query("INSERT INTO " + 
                            "Pet(user_id, name, species, description, arduino_mac, pi_mac) " + 
                        "VALUES (" +
                            mysql.escape(user_id) + ", " +
                            mysql.escape(name) + ", " +
                            mysql.escape(species) + ", " +
                            mysql.escape(description) + ", " +
                            mysql.escape(arduino_mac) + ", " +
                            mysql.escape(pi_mac) + ")");

        qresult = connection.query("SELECT LAST_INSERT_ID() as pet_id");
        var pet_id = qresult[0]["pet_id"];

        utils.log(logger_caller, "Success", logger_args);
        res.status(200).json({
            "pet_id": pet_id
        });
        return;
    } catch(e) {
        utils.log(logger_caller, "Error - " + e, logger_args, "r");
        res.sendStatus(400);
        return;
    }
}