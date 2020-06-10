var utils = require("../utils");

var mysql = require("mysql");
var sync_mysql = require("sync-mysql");
var db_config = require("../config/db");
var connection = new sync_mysql(db_config);

module.exports = function(req, res, next) {
    var logger_caller = "/user-info(GET)";
    var logger_args = {"user_id": req.query.user_id, "token": req.headers["x-access-token"] };

    var user_id = req.query.user_id;
    var token = req.headers["x-access-token"];

    if(user_id === undefined || user_id.length == 0) {
        utils.log(logger_caller, "Error - Invalid params", logger_args, "y");
        res.sendStatus(401);
        return;
    }

    var token_verification_result = utils.verifyToken(token, user_id);
    if(token_verification_result == utils.ERROR_EXPIRED_TOKEN) {
        utils.log(logger_caller, "Error - Token expired", logger_args);
        res.sendStatus(405);
        return;
    } else if (token_verification_result == utils.ERROR_INVALID_TOKEN) {
        utils.log(logger_caller, "Error - Invalid token", logger_args);
        res.sendStatus(403);
        return;
    }

    try {
        var qresult;
        qresult = connection.query("SELECT " +
                                        "email, first_name, last_name, phone_number " +
                                    "FROM " + 
                                        "User " + 
                                    "WHERE " + 
                                        "id=" + mysql.escape(user_id));

        if(qresult.length == 0) {
            utils.log(logger_caller, "Error - Invalid Params", logger_args, "y");
            res.sendStatus(401);
            return;
        }

        var email = qresult[0]["email"];
        var user_first_name = qresult[0]["first_name"];
        var user_last_name = qresult[0]["last_name"];
        var user_phone_number = qresult[0]["phone_number"];

        qresult = connection.query("SELECT " +
                                        "pet_id, name, species, description, photo_id, arduino_mac, pi_mac " +
                                    "FROM " + 
                                        "Pet " + 
                                    "WHERE " + 
                                        "user_id=" + mysql.escape(user_id));

        var pets = [];
        for(var i = 0; i < qresult.length; i++) {
            pets.push({
                "pet_id": qresult[i]["pet_id"],
                "name": qresult[i]["name"],
                "species": qresult[i]["species"],
                "description": qresult[i]["description"],
                "photo_id": qresult[i]["photo_id"],
                "arduino_mac": qresult[i]["arduino_mac"],
                "pi_mac": qresult[i]["pi_mac"]
            });
        }

        utils.log(logger_caller, "Success", logger_args);
        res.status(200).json({
            "user_id": user_id,
            "email": email,
            "token": token,
            "first_name": user_first_name,
            "last_name": user_last_name,
            "phone_number": user_phone_number,
            "pets": pets
        });

        return;
    } catch(e) {
        utils.log(logger_caller, "Error - " + e, logger_args, "r");
        res.sendStatus(400);
        return;
    }
}