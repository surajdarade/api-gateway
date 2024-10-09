import express, { Request, Response } from "express";

const app = express();

const PORT = process.env.PORT || 3001;
const HOST = "product-service";

app.use(express.json());

app.listen(PORT, () => {
  console.log(`Product service running on port ${PORT}`);
});
