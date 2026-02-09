"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var helmet_1 = require("helmet");
var morgan_1 = require("morgan");
var rateLimiter_1 = require("./utils/rateLimiter");
var auth_1 = require("./middleware/auth");
var app = (0, express_1.default)();
var PORT = 3000;
app.use(express_1.default.json());
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)("combined"));
app.use(auth_1.default);
app.use(rateLimiter_1.default);
app.listen(PORT, function () {
    console.log("API GATEWAY STARTED ON PORT: ".concat(PORT, " \uD83D\uDE80"));
});
