import express, { Request, Response } from "express";
import axios from "axios";
import fs from "fs";
import Joi from "joi";
import loadBalancer from "../utils/loadBalancer";
import registry from "./registry.json";

const router = express.Router();

const registrationSchema = Joi.object({
  apiName: Joi.string().required(),
  protocol: Joi.string().valid("http", "https").required(),
  host: Joi.string().hostname().required(),
  port: Joi.number().integer().min(1).max(65535).required(),
  weight: Joi.number().integer().min(1).default(1),
  connections: Joi.number().integer().min(0).default(0),
  healthCheckPaths: Joi.array()
    .items(Joi.string().required())
    .min(1)
    .required(),
});

export default router;