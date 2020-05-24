var secret = require("../config/secret");

module.exports = {
    service: "gmail",
    auth: {
        user: "skku.snoot@gmail.com",
        pass: secret.mail_password
    }
};