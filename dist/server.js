"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const rateLimiter_1 = __importDefault(require("./utils/rateLimiter"));
const auth_1 = __importDefault(require("./middleware/auth"));
const app = (0, express_1.default)();
const PORT = 3000;
app.use(express_1.default.json());
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)("combined"));
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});
app.use(auth_1.default);
app.use(rateLimiter_1.default);
app.listen(PORT, () => {
    console.log(`API GATEWAY STARTED ON PORT: ${PORT} 🚀`);
});
