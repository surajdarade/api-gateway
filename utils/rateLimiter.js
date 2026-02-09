"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_rate_limit_1 = require("express-rate-limit");
var rateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 5 * 60 * 1000, // 5 Minutes
    max: 50, // 50 Max Requests / 5 Minutes
    message: "Too Many Requests! Wait Before Making Further Requests!",
});
exports.default = rateLimiter;
