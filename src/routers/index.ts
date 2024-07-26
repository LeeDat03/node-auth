import express from "express";
import { user } from "./user";
import { auth } from "./auth";
import { oAuth } from "./oauth";

const router = express.Router();

const routesHandler = (): express.Router => {
  auth(router);
  oAuth(router);

  return router;
};

export default routesHandler;
