var utils = require("../utils");

var mysql = require("mysql");
var sync_mysql = require("sync-mysql");
var db_config = require("../config/db");
var connection = new sync_mysql(db_config);

module.exports = function (req, res, next) {
    var logger_caller = "/login(POST)";
    var logger_args = {"email": req.body.email, "pw_hashed": req.body.pw_hashed};

    var email = req.body.email;
    var pw_from_client = req.body.pw_hashed;

    if(email === undefined || email.length == 0 || !utils.isEmail(email)
        || pw_from_client === undefined || pw_from_client.length != 45) {
        utils.log(logger_caller, "Error - Invalid params", logger_args, "y");
        res.sendStatus(401);
        return;
    }

    try {
        var qresult;
        qresult = connection.query("SELECT " +
                                        "id, pw_hashed, salt, first_name, last_name, phone_number " +
                                    "FROM " + 
                                        "User " + 
                                    "WHERE " + 
                                        "email=" + mysql.escape(email));

        if(qresult.length == 0) {
            utils.log(logger_caller, "Error - No such email", logger_args, "y");
            res.sendStatus(401);
            return;
        }

        if(qresult[0]["pw_hashed"] != utils.hash(pw_from_client, qresult[0]["salt"])) {
            utils.log(logger_caller, "Error - pw_hashed not matching", logger_args, "y");
            res.sendStatus(401);
            return;
        }

        var user_id = qresult[0]["id"];
        var user_first_name = qresult[0]["first_name"];
        var user_last_name = qresult[0]["last_name"];
        var user_phone_number = qresult[0]["phone_number"];

        var token = utils.createNewToken(user_id);

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

        utils.log(logger_caller, "Success - " + token, logger_args);
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
        //throw e;
        utils.log(logger_caller, "Error - " + e, logger_args, "r");
        res.sendStatus(400);
        return;
    }
}

