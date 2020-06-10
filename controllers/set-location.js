var utils = require("../utils");

var mysql = require("mysql");
var sync_mysql = require("sync-mysql");
var db_config = require("../config/db");
var connection = new sync_mysql(db_config);

module.exports = function (req, res, next) {
    var logger_caller = "/set-location(GET)";
    var logger_args = { "pi_mac": req.query.wifi_mac, "longitude": req.query.longitude, "latitude": req.query.latitude, "time": req.query.time };

    var pi_mac = req.query.wifi_mac;
    var longitude = req.query.longitude;
    var latitude = req.query.latitude;
    var time = utils.convertDateTimeToISO(req.query.time);

    if(pi_mac === undefined || pi_mac.length != 17
        || longitude === undefined || longitude.length == 0
        || latitude === undefined || latitude.length == 0
        || time === undefined) {
        utils.log(logger_caller, "Error - Invalid params", logger_args, "y");
        res.sendStatus(401);
        return;
    }
    
    try {
        var qresult = connection.query("SELECT pet_id FROM Pet WHERE pi_mac=" + mysql.escape(pi_mac));
        if(qresult.length == 0) {
            utils.log(logger_caller, "Error - Invalid params", logger_args, "y");
            res.sendStatus(401);
            return;
        }

        var pet_id = qresult[0]["pet_id"];
        var location = longitude + " " + latitude

        connection.query("INSERT INTO " +
                                "Location(pet_id, time, location) " +
                            "VALUES (" +
                                mysql.escape(pet_id) + ", " + 
                                mysql.escape(time.toISOString()) + ", " +
                                mysql.escape(location) + ")");

        utils.log(logger_caller, "Success", logger_args);
        res.sendStatus(200);
        return;
    } catch(e) {
        utils.log(logger_caller, "Error - " + e, logger_args, "r");
        res.sendStatus(400);
        return;
    }
}