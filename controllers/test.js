var utils = require("../utils");

module.exports = function(req, res, next) {
    var logger_caller = "/test(GET)";
    var logger_args = {  };

    res.status(200).json({
        "msg": "Hi!"
    });

    utils.log(logger_caller, "Success", logger_args);

    return;
}

