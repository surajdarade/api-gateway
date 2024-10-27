import express, { Request, Response, NextFunction } from "express";
import axios from "axios";
import fs from "fs";
import Joi from "joi";
import loadBalancer from "../utils/loadBalancer";
import registryData from "./registry.json";

const router = express.Router();

interface ServiceInstance {
  apiName: string;
  protocol: string;
  host: string;
  port: number;
  weight: number;
  connections: number;
  url: string;
  enabled: boolean;
  healthCheckPaths: string[];
}

interface Service {
  index: number;
  instances: ServiceInstance[];
  loadBalancerStrategy: string;
}

interface Registry {
  services: {
    [key: string]: Service;
  };
}

const registry: Registry = registryData as Registry;

const registrationSchema = Joi.object({
  apiName: Joi.string().required(),
  protocol: Joi.string().valid("http", "https").required(),
  host: Joi.string().hostname().required(),
  port: Joi.number().integer().min(1).max(65535).required(),
  weight: Joi.number().integer().min(1).default(1),
  connections: Joi.number().integer().min(0).default(0),
  healthCheckPaths: Joi.array().items(Joi.string().required()).min(1).required(),
});

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

router.post("/enable/:apiName", asyncHandler(async (req: Request, res: Response) => {
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

  await fs.promises.writeFile("./routes/registry.json", JSON.stringify(registry, null, 2));
  res.send(`Instance in service '${apiName}' successfully updated`);
}));

router.post("/register", asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = registrationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const registrationInfo = value as ServiceInstance;
  registrationInfo.url = `${registrationInfo.protocol}://${registrationInfo.host}:${registrationInfo.port}/`;

  if (!registry.services[registrationInfo.apiName]) {
    registry.services[registrationInfo.apiName] = {
      index: 0,
      loadBalancerStrategy: "ROUND_ROBIN",
      instances: [],
    };
  }

  registry.services[registrationInfo.apiName].instances.push(registrationInfo);

  await fs.promises.writeFile("./routes/registry.json", JSON.stringify(registry, null, 2));
  res.send(`Service '${registrationInfo.apiName}' successfully registered`);
}));

router.post("/unregister", asyncHandler(async (req: Request, res: Response) => {
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

  await fs.promises.writeFile("./routes/registry.json", JSON.stringify(registry, null, 2));
  res.send(`Service '${apiName}' successfully unregistered`);
}));

router.all("/:apiName/:path(*)?", asyncHandler(async (req: Request, res: Response) => {
  const service = registry.services[req.params.apiName];
  if (!service) {
    return res.status(404).send("API Name does not exist");
  }

  const newIndex = await loadBalancer[service.loadBalancerStrategy](service);
  if (newIndex === -1) {
    return res.status(500).send("No enabled instances available");
  }

  const targetInstance = service.instances[newIndex];
  const url = `${targetInstance.url}${req.params.path || ""}`;

  const response = await axios({
    method: req.method,
    url,
    headers: req.headers,
    data: req.body,
  });

  res.status(response.status).send(response.data);
}));

export default router;