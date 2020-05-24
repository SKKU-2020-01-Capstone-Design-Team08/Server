var moment = require("moment-timezone");
var crypto = require("crypto");

moment.tz.setDefault("Asia/Seoul");

module.exports.log = function(caller, msg, args, msg_color) {
    var date = moment().format("YYYY-MM-DD HH:mm:ss");

    switch(msg_color) {
        case "r": //red
            msg_color = "\x1b[31m";
            break;
        case "y": //yellow
            msg_color = "\x1b[33m";
            break;
        case "b": //blue
            msg_color = "\x1b[34m";
            break;
        default:
            msg_color = "\x1b[0m";
            break;
    }

    if (msg === undefined) {
        msg = "";
    }
    
    if (args === undefined) {
        args = "";
    }

    if (Object.keys(args).length === 0) {
        console.log("\x1b[32m[%s] [%s] %s%s\x1b[0m\n", date, caller, msg_color, msg);
    } else {
        console.log("\x1b[32m[%s] [%s] %s%s\x1b[0m - %j\n", date, caller, msg_color, msg, args);
    }
}

module.exports.hash = function(string, salt) {
    return crypto.pbkdf2Sync(string, salt, 654321, 32, "sha256").toString("Base64");
}

module.exports.createNewSalt = function() {
    return crypto.randomBytes(32).toString("Base64");
}

module.exports.isEmail = function(string) {
    var email_regExp = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;
    return email_regExp.test(string);
}

module.exports.createNewCode = function() {
    return crypto.randomBytes(6).toString("Base64");
}