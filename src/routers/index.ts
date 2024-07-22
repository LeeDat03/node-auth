import express from "express";
import { user } from "./user";
import { auth } from "./auth";

const router = express.Router();

const routesHandler = (): express.Router => {
  auth(router);

  return router;
};

export default routesHandler;
