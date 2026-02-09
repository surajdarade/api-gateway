"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const loadBalancer = {};
const MAX_RETRIES = 3; // Max Attempts to Check Server Health
loadBalancer.ROUND_ROBIN = async (service) => {
    console.log(`Loadbalancer ${service.index}`);
    const newIndex = ++service.index >= service.instances.length ? 0 : service.index;
    service.index = newIndex;
    console.log(`Checking if instance ${service.instances[newIndex].url} is enabled`);
    const enabledIndex = await loadBalancer.isEnabled(service);
    return enabledIndex;
};
loadBalancer.isEnabled = async (service) => {
    const index = service.index;
    const instance = service.instances[index];
    if (await checkHealth(instance)) {
        return index;
    }
    else {
        instance.enabled = false; // Mark the instance as down
        for (let i = 0; i < service.instances.length; i++) {
            const nextIndex = (index + i + 1) % service.instances.length;
            if (await checkHealth(service.instances[nextIndex])) {
                return nextIndex; // Return the next healthy instance
            }
        }
    }
    return -1; // No healthy instances found
};
const checkHealth = async (instance) => {
    let attempts = 0;
    for (const path of instance.healthCheckPaths) {
        try {
            const response = await axios_1.default.get(`${instance.url}${path}`);
            if (response.status === 200) {
                return true; // Instance is healthy
            }
        }
        catch (error) {
            attempts++;
            console.error(`Health check failed for ${instance.url + path} :`, error.message);
            if (attempts >= MAX_RETRIES) {
                console.error(`Max retries reached for ${instance.url}. Marking as down.`);
                return false; // Mark as down after maximum retries
            }
        }
    }
    return false; // None of the health checks passed
};
exports.default = loadBalancer;
