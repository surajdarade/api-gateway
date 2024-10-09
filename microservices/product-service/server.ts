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
  console.log(`Product service running on port ${PORT}`);
});
