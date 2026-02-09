"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const registry_json_1 = __importDefault(require("../routes/registry.json"));
const registryData = registry_json_1.default;
const auth = (req, res, next) => {
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
    const authString = Buffer.from(req.headers.authorization.split(" ")[1], "base64").toString("utf-8");
    const [username, password] = authString.split(":");
    const user = registryData.auth.users[username];
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
