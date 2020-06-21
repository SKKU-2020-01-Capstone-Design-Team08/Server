var moment = require("moment-timezone");
var crypto = require("crypto");
var secret = require("./config/secret");

moment.tz.setDefault("Asia/Seoul");

var jwt = require("jsonwebtoken");

module.exports.log = function (caller, msg, args, msg_color) {
    var date = moment().format("YYYY-MM-DD HH:mm:ss");

    switch (msg_color) {
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

module.exports.hash = function (string, salt) {
    return crypto.pbkdf2Sync(string, salt, 654321, 32, "sha256").toString("Base64");
}

module.exports.createNewSalt = function () {
    return crypto.randomBytes(24).toString("Base64");
}

module.exports.isEmail = function (string) {
    var email_regExp = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;
    return email_regExp.test(string);
}

module.exports.isValidDatetime = function(string) {
    var datetime_regExp = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
    if(!datetime_regExp.test(string)) return false;

    var temp, date_str, time_str, year, date, month, hour, minute, second;
    temp = string.split(" ");
    date_str = temp[0];
    time_str = temp[1];

    temp = date_str.split("-");
    year = Number(temp[0]);
    month = Number(temp[1]);
    date = Number(temp[2]);

    temp = time_str.split(":");
    hour = Number(temp[0]);
    minute = Number(temp[1]);
    second = Number(temp[2]);

    var isLeapyear = false;
    if( ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0) ) {
        isLeapyear = true;
    }

    if(month < 1 || month > 12) return false;

    if(date < 1) return false;
    switch(month) {
        case 1:
        case 3:
        case 5:
        case 7:
        case 8:
        case 10:
        case 12:
            if(date > 31) return false;
            break;
        case 4:
        case 6:
        case 9:
        case 11:
            if(date > 30) return false;
            break;
        case 2:
            if(isLeapyear && date > 29) return false;
            else if (!isLeapyear && date > 28) return false;
            break;
        default:
            return false;
    }

    if(hour < 0 || hour >= 24) return false;
    if(minute < 0 || minute >= 60) return false;
    if(second < 0 || second >= 60) return false;
    
    //return new Date(date_str + "T" + time_str + "+00:00");
    return true;
}

module.exports.convertISOToDatetime = function(string) {
    var input = new Date(string);

    var year = input.getFullYear();
    var month = ("0" + (input.getMonth() + 1)).slice(-2);
    var date = ("0" + input.getDate()).slice(-2);
    var hour = ("0" + input.getHours()).slice(-2);
    var minute = ("0" + input.getMinutes()).slice(-2);
    var second = ("0" + input.getSeconds()).slice(-2);

    return year + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + second;
}

module.exports.createNewCode = function () {
    return crypto.randomBytes(6).toString("Base64");
}

module.exports.createNewToken = function (user_id) {
    return jwt.sign(
        {
            "user_id": user_id
        },
        secret.jwt_secret,
        {
            expiresIn: 3600,
            issuer: "snoot",
            audience: String(user_id)
        }
    );
}

module.exports.verifyToken = function (token, user_id) {
    try {
        var decoded = jwt.verify(token, secret.jwt_secret);
        if (decoded.user_id == user_id) {
            return this.SUCCESS;
        }

        return this.ERROR_INVALID_TOKEN;
    } catch (e) {
        if (e.name == "TokenExpiredError") {
            return this.ERROR_EXPIRED_TOKEN;
        }
        return this.ERROR_INVALID_TOKEN;
    }
}

module.exports.SUCCESS = 0;
module.exports.ERROR_EXPIRED_TOKEN = 1;
module.exports.ERROR_INVALID_TOKEN = 2;
