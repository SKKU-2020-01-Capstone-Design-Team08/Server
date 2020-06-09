var utils = require("../utils");

var mysql = require("mysql");
var sync_mysql = require("sync-mysql");
var db_config = require("../config/db");
var connection = new sync_mysql(db_config);

module.exports = function (req, res, next) {
    var logger_caller = "/get-location(GET)";
    var logger_args = { "pet_id": req.query.pet_id, "token": req.headers["x-access-token"] };

    var pet_id = req.query.pet_id;
    var token = req.headers["x-access-token"]

    if(!token) {
        utils.log(logger_caller, "Error - Invalid token", logger_args);
        res.sendStatus(403);
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

    if(pet_id === undefined || pet_id.length == 0) {
        utils.log(logger_caller, "Error - Invalid params", logger_args);
        res.sendStatus(401);
        return;
    }
    
    try {
        var qresult = connection.query("SELECT location, time FROM Location WHERE pet_id=" + mysql.escape(pet_id) + " ORDER BY time DESC LIMIT 1");
        if(qresult.length == 0) {
            utils.log(logger_caller, "Error - Invalid params", logger_args, "y");
            res.sendStatus(401);
            return;
        }

        var location = qresult[0]["location"];
        var time = utils.convertISOToDatetime(qresult[0]["time"]);

        var temp = location.split(" ");
        var longitude = Number(temp[0]);
        var latitude = Number(temp[1]);

        utils.log(logger_caller, "Success", logger_args);
        res.status(200).json({
            "time": time,
            "location": {
                "lon": longitude,
                "lat": latitude
            }
        });
        return;
    } catch(e) {
        utils.log(logger_caller, "Error - " + e, logger_args, "r");
        res.sendStatus(400);
        return;
    }
}