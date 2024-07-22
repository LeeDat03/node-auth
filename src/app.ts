import express from "express";
import bodyParser from "body-parser";

import routesHandler from "./routers/index";

const app = express();

// Read the request body
app.use(bodyParser.json());

// Handle the routes
app.use("/api/v1", routesHandler());

export default app;
