var utils = require("../utils");

module.exports = function(req, res, next) {
    var logger_caller = "/test(POST)";
    var logger_args = { "pet_id": req.body.petId };

    var pet_id = req.body.petId;

    res.status(200).json({
        "msg": "Received [" + pet_id + "]"
    });

    utils.log(logger_caller, "Success", logger_args);

    return;
}

