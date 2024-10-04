import express, { Request, Response } from "express";
import axios from "axios";

const PORT = process.env.PORT || 3001;
const HOST = "order-service";

const app = express();

app.use(express.json());

app.get("/orders", async (req: Request, res: Response): Promise<void> => {
  try {
    const response = await axios.get(
      "https://66a0d43e7053166bcabd025a.mockapi.io/api/v1/orders"
    );

    if (response.status >= 200 && response.status < 300) {
      res.status(200).json(response.data);
    } else {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const registerService = async (encodedAuthString: string): Promise<void> => {
  console.log("Attempting to register service with gateway!");

  try {
    const response = await axios({
      method: "POST",
      url: "http://api-gateway:3000/register",
      headers: {
        authorization: `Basic ${encodedAuthString}`,
        "Content-Type": "application/json",
      },
      data: {
        apiName: "order-service",
        protocol: "http",
        host: HOST,
        port: PORT,
        connections: 0,
        weight: 1,
        healthCheckPaths: ["/orders"],
      },
    });

    console.log("Order service registered successfully!", response.data);
  } catch (err: any) {
    console.error("Error during service registration:", err.message);
    if (axios.isAxiosError(err) && err.response) {
      console.error("Response data:", err.response.data);
      console.error("Response status:", err.response.status);
      console.error("Response headers:", err.response.headers);
    }
    setTimeout(() => registerService(encodedAuthString), 5000);
  }
};

app.listen(PORT, () => {
  const authString = "surajdarade:surajdarade";
  const encodedAuthString = Buffer.from(authString, "utf-8").toString("base64");
  console.log(`Encoding authstring: ${encodedAuthString}`);
  console.log(`Order service running on port ${PORT}`);
});

process.on("SIGINT", async () => {
  console.log("Received SIGINT. Unregistering Service...");
  await unregisterService();
  process.exit();
});

const unregisterService = async (): Promise<void> => {
  const authString = "surajdarade:surajdarade";
  const encodedAuthString = Buffer.from(authString, "utf-8").toString("base64");

  console.log("Attempting to unregister service from the gateway");

  try {
    const response = await axios({
      method: "POST",
      url: "http://localhost:3000/unregister",
      headers: {
        authorization: `Basic ${encodedAuthString}`,
        "Content-Type": "application/json",
      },
      data: {
        apiName: "order-service",
        protocol: "http",
        host: HOST,
        port: PORT,
        connections: 0,
        weight: 1,
        heightCheckPaths: ["/orders"],
      },
    });
    console.log("Service Unregistered Successfully: ", response.data);
  } catch (error: any) {
    console.error("Error during service unregistration: ", error.message);
    if (axios.isAxiosError(error) && error.message) {
      console.error("Response data: ", error?.response?.data);
      console.error("Response status: ", error?.response?.status);
      console.error("Response headers: ", error?.response?.headers);
    }
  }
};
