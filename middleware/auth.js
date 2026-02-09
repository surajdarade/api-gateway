"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var registry_json_1 = require("../routes/registry.json");
var registryData = registry_json_1.default;
var auth = function (req, res, next) {
    if (!req.headers.authorization ||
        !req.headers.authorization.startsWith("Basic ")) {
        res
            .status(401)
            .send({
            authenticated: false,
            message: "Missing or invalid authorization header",
        });
        return;
    }
    var authString = Buffer.from(req.headers.authorization.split(" ")[1], "base64").toString("utf-8");
    var _a = authString.split(":"), username = _a[0], password = _a[1];
    var user = registryData.auth.users[username];
    if (user && user.password === password) {
        next();
    }
    else {
        res
            .status(401)
            .send({ authenticated: false, message: "Authentication failed" });
        return;
    }
};
exports.default = auth;
