"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
const HOST = "product-service";
app.use(express_1.default.json());
app.get("/products", async (req, res) => {
    try {
        const response = await axios_1.default.get("https://66a0d43e7053166bcabd025a.mockapi.io/api/v1/products");
        if (response.status >= 200 && response.status < 300) {
            res.status(200).json(response.data);
        }
        else {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
    }
    catch (error) {
        console.error("Error fetching products: ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
});
app.listen(PORT, () => {
    const authString = "surajdarade:surajdarade";
    const encodedAuthString = Buffer.from(authString, "utf-8").toString("base64");
    console.log(`Encoding authstring: ${encodedAuthString}`);
    console.log(`Product service running on port ${PORT}`);
    registerService(encodedAuthString);
});
const registerService = async (encodedAuthString) => {
    console.log("Attempting to register service with the gateway...");
    try {
        const response = await (0, axios_1.default)({
            method: "POST",
            url: "http://api-gateway:3000/register",
            headers: {
                authorization: `Basic ${encodedAuthString}`,
                "Content-Type": "application/json",
            },
            data: {
                apiName: "product-service",
                protocol: "http",
                host: HOST,
                port: PORT,
                connections: 0,
                weight: 1,
                healthCheckPaths: ["/products"],
            },
        });
        console.log("Service registered successfully:", response.data);
    }
    catch (err) {
        console.error("Error during service registration:", err.message);
        if (err.response) {
            console.error("Response data:", err.response.data);
            console.error("Response status:", err.response.status);
            console.error("Response headers:", err.response.headers);
        }
        setTimeout(() => registerService(encodedAuthString), 5000);
    }
};
process.on("SIGINT", async () => {
    console.log("Received SIGINT. Unregistering service...");
    await unregisterService();
    process.exit();
});
const unregisterService = async () => {
    const authString = "johndoe:password";
    const encodedAuthString = Buffer.from(authString, "utf-8").toString("base64");
    console.log("Attempting to unregister service from the gateway...");
    try {
        const response = await (0, axios_1.default)({
            method: "POST",
            url: "http://api-gateway:3000/unregister",
            headers: {
                authorization: `Basic ${encodedAuthString}`,
                "Content-Type": "application/json",
            },
            data: {
                apiName: "product-service",
                protocol: "http",
                host: HOST,
                port: PORT,
                connections: 0,
                weight: 1,
                healthCheckPaths: ["/products"],
            },
        });
        console.log("Service unregistered successfully:", response.data);
    }
    catch (err) {
        console.error("Error during service unregistration:", err.message);
        if (err.response) {
            console.error("Response data:", err.response.data);
            console.error("Response status:", err.response.status);
            console.error("Response headers:", err.response.headers);
        }
    }
};
