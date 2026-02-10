import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import rateLimiter from "./utils/rateLimiter";
import auth from "./middleware/auth";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(helmet());
app.use(morgan("combined"));

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.use(auth);
app.use(rateLimiter);

app.listen(PORT, () => {
  console.log(`API GATEWAY STARTED ON PORT: ${PORT} 🚀`);
});