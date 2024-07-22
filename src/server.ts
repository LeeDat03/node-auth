import mongoose from "mongoose";
import http from "http";
import dotenv from "dotenv";
import app from "./app";

// read .env file
dotenv.config();

// Init the server express
const server = http.createServer(app);

// Connect to the database
mongoose.connect(process.env.DATABASE_URL).then(() => {
  console.log("Connect to DB successfully");
});

// Listen to the server
server.listen(process.env.PORT || 8005, () => {
  console.log(`Server is running on port ${process.env.PORT || 8005}`);
});
