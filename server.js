var http = require("http");
var express = require("express");
var app = express();
//var session = require("express-session");
//var secret = require("./config/secret");
var bodyParser = require("body-parser");

/*
app.use(session({
    secret: secret.session_secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 5 //Cookie valid for 5 min
    }
}));*/

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/", require("./router"));

http.createServer(app).listen(80, function() {
    console.log("Express server started on port 80");
});