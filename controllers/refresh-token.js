var utils = require("../utils");

module.exports = function (req, res, next) {
    var logger_caller = "/refresh-token(GET)";
    var logger_args = { "user_id": req.query.user_id, "token": req.headers["x-access-token"] };

    var user_id = req.query.user_id;
    var token = req.headers["x-access-token"];

    if(user_id === undefined || user_id.length == 0) {
        utils.log(logger_caller, "Error - Invalid params", logger_args, "y");
        res.sendStatus(401);
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

    var new_token = utils.createNewToken(user_id);

    utils.log(logger_caller, "Success - " + new_token, logger_args);
    res.status(200).json({
        "token": new_token
    });
    return;
}