import express, { Request, Response } from "express";
import axios from "axios";
import fs from "fs";
import Joi from "joi";
import loadBalancer from "../utils/loadBalancer";
import registry from "./registry.json";

const router = express.Router();

export default router;