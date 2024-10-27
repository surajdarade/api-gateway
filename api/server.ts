import express, { Request, Response, NextFunction } from "express";
import axios from "axios";
import { Server } from "http";

const app = express();
const PORT = 3002;
const HOST = "localhost";

app.use(express.json());

app.get("/fakeapi", (req: Request, res: Response, next: NextFunction) => {
  console.log(`hello from fakeapi`);
  res.send("Hello from fakeapi");
});

app.post("/bogusapi", (req: Request, res: Response, next: NextFunction) => {
  console.log(`hello from bogusapi`);
  res.send("Hello from bogusapi");
});

let server: Server;

app.listen(PORT, () => {
  const authString = "surajdarade:surajdarade";
  const encodedAuthString = Buffer.from(authString, "utf-8").toString("base64");
  console.log(`Encoding authstring: ${encodedAuthString}`);
  console.log("Fake API server started on port " + PORT);

  registerService(encodedAuthString);
});

function registerService(encodedAuthString: string) {
  console.log("Attempting to register service with the gateway...");
  axios({
    method: "POST",
    url: "http://localhost:3000/register",
    headers: {
      authorization: `Basic ${encodedAuthString}`,
      "Content-Type": "application/json",
    },
    data: {
      apiName: "testapi",
      protocol: "http",
      host: HOST,
      port: PORT,
      connections: 0,
      weight: 1,
      healthCheckPaths: ["/fakeapi", "/bogusapi"],
    },
  })
    .then((response) => {
      console.log("Service registered successfully:", response.data);
    })
    .catch((err) => {
      console.error("Error during service registration:", err.message);
      if (err.response) {
        console.error("Response data:", err.response.data);
        console.error("Response status:", err.response.status);
        console.error("Response headers:", err.response.headers);
      }
    });
}

process.on("SIGINT", () => {
  console.log("Received SIGINT. Unregistering service...");
  unregisterService().then(() => {
    process.exit();
  });
});

async function unregisterService() {
  const authString = "johndoe:password";
  const encodedAuthString = Buffer.from(authString, "utf-8").toString("base64");

  console.log("Attempting to unregister service from the gateway...");
  try {
    const response = await axios({
      method: "POST",
      url: "http://localhost:3000/unregister",
      headers: {
        authorization: `Basic ${encodedAuthString}`,
        "Content-Type": "application/json",
      },
      data: {
        apiName: "testapi",
        protocol: "http",
        host: HOST,
        port: PORT,
        connections: 0,
        weight: 1,
        healthCheckPaths: ["/fakeapi", "/bogusapi"],
      },
    });
    console.log("Service unregistered successfully:", response.data);
  } catch (err: any) {
    console.error("Error during service unregistration:", err.message);
    if (err.response) {
      console.error("Response data:", err.response.data);
      console.error("Response status:", err.response.status);
      console.error("Response headers:", err.response.headers);
    }
  }
}