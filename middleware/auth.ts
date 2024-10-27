import { RequestHandler } from "express";
import registry from "../routes/registry.json";

interface User {
  password: string;
}

interface Registry {
  auth: {
    users: {
      [key: string]: User;
    };
  };
}

const registryData: Registry = registry;

const auth: RequestHandler = (req, res, next) => {
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Basic ")
  ) {
    res
      .status(401)
      .send({
        authenticated: false,
        message: "Missing or invalid authorization header",
      });
    return;
  }

  const authString = Buffer.from(
    req.headers.authorization.split(" ")[1],
    "base64"
  ).toString("utf-8");
  const [username, password] = authString.split(":");

  const user = registryData.auth.users[username];
  if (user && user.password === password) {
    next(); 
  } else {
    res
      .status(401)
      .send({ authenticated: false, message: "Authentication failed" });
    return; 
  }
};

export default auth;