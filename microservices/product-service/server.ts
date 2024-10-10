import express, { Request, Response } from "express";
import axios from "axios";
const app = express();

const PORT = process.env.PORT || 3001;
const HOST = "product-service";

app.use(express.json());

app.get("/products", async (req: Request, res: Response): Promise<void> => {
  try {
    const response = await axios.get(
      "https://66a0d43e7053166bcabd025a.mockapi.io/api/v1/products"
    );

    if (response.status >= 200 && response.status < 300) {
      res.status(200).json(response.data);
    } else {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
  } catch (error: any) {
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

const registerService = async (encodedAuthString: string): Promise<void> => {
  console.log("Attempting to register service with the gateway...");
  try {
    const response = await axios({
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
  } catch (err: any) {
    console.error("Error during service registration:", err.message);
    if (err.response) {
      console.error("Response data:", err.response.data);
      console.error("Response status:", err.response.status);
      console.error("Response headers:", err.response.headers);
    }
    setTimeout(() => registerService(encodedAuthString), 5000);
  }
}