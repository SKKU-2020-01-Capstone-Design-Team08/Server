var secret = require("../config/secret");

module.exports = {
    host: "localhost",
    user: "snoot",
    password: secret.db_password,
    database: "Snoot"
};