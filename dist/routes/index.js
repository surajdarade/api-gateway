"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const joi_1 = __importDefault(require("joi"));
const loadBalancer_1 = __importDefault(require("../utils/loadBalancer"));
const registry_json_1 = __importDefault(require("./registry.json"));
const router = express_1.default.Router();
const registry = registry_json_1.default;
const registrationSchema = joi_1.default.object({
    apiName: joi_1.default.string().required(),
    protocol: joi_1.default.string().valid("http", "https").required(),
    host: joi_1.default.string().hostname().required(),
    port: joi_1.default.number().integer().min(1).max(65535).required(),
    weight: joi_1.default.number().integer().min(1).default(1),
    connections: joi_1.default.number().integer().min(0).default(0),
    healthCheckPaths: joi_1.default.array().items(joi_1.default.string().required()).min(1).required(),
});
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
router.post("/enable/:apiName", asyncHandler(async (req, res) => {
    const apiName = req.params.apiName;
    const { url, enabled } = req.body;
    const instances = registry.services[apiName]?.instances;
    if (!instances) {
        return res.status(404).send(`Service ${apiName} not found`);
    }
    const instanceIndex = instances.findIndex((srv) => srv.url === url);
    if (instanceIndex === -1) {
        return res.status(404).json({ status: "error", message: `Instance with URL ${url} not found in service ${apiName}` });
    }
    instances[instanceIndex].enabled = enabled;
    await fs_1.default.promises.writeFile("./routes/registry.json", JSON.stringify(registry, null, 2));
    res.send(`Instance in service '${apiName}' successfully updated`);
}));
router.post("/register", asyncHandler(async (req, res) => {
    const { error, value } = registrationSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    const registrationInfo = value;
    registrationInfo.url = `${registrationInfo.protocol}://${registrationInfo.host}:${registrationInfo.port}/`;
    if (!registry.services[registrationInfo.apiName]) {
        registry.services[registrationInfo.apiName] = {
            index: 0,
            loadBalancerStrategy: "ROUND_ROBIN",
            instances: [],
        };
    }
    registry.services[registrationInfo.apiName].instances.push(registrationInfo);
    await fs_1.default.promises.writeFile("./routes/registry.json", JSON.stringify(registry, null, 2));
    res.send(`Service '${registrationInfo.apiName}' successfully registered`);
}));
router.post("/unregister", asyncHandler(async (req, res) => {
    const { apiName, url } = req.body;
    const service = registry.services[apiName];
    if (!service) {
        return res.status(404).json({ status: "error", message: `Service ${apiName} not found` });
    }
    const instanceIndex = service.instances.findIndex((instance) => instance.url === url);
    if (instanceIndex === -1) {
        return res.status(404).json({ status: "error", message: `Instance with URL ${url} not found in service ${apiName}` });
    }
    service.instances.splice(instanceIndex, 1);
    await fs_1.default.promises.writeFile("./routes/registry.json", JSON.stringify(registry, null, 2));
    res.send(`Service '${apiName}' successfully unregistered`);
}));
router.all("/:apiName/:path(*)?", asyncHandler(async (req, res) => {
    const service = registry.services[req.params.apiName];
    if (!service) {
        return res.status(404).send("API Name does not exist");
    }
    const newIndex = await loadBalancer_1.default[service.loadBalancerStrategy](service);
    if (newIndex === -1) {
        return res.status(500).send("No enabled instances available");
    }
    const targetInstance = service.instances[newIndex];
    const url = `${targetInstance.url}${req.params.path || ""}`;
    const response = await (0, axios_1.default)({
        method: req.method,
        url,
        headers: req.headers,
        data: req.body,
    });
    res.status(response.status).send(response.data);
}));
exports.default = router;
