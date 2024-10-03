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
  } catch (error) {}
};

app.listen(PORT, () => {
  const authString = "surajdarade:surajdarade";
  const encodedAuthString = Buffer.from(authString, "utf-8").toString("base64");
  console.log(`Encoding authstring: ${encodedAuthString}`);
  console.log(`Order service running on port ${PORT}`);
});
