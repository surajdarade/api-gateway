import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import rateLimiter from "./utils/rateLimiter";

const app = express();

const PORT = 3000;

app.use(express.json());
app.use(helmet());
app.use(morgan("combined"));

app.use(rateLimiter);

app.listen(PORT, () => {
  console.log(`Server listening on PORT: ${PORT} 🚀`);
});
