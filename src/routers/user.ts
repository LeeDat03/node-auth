import express from "express";

export const user = (router: express.Router) => {
  router.get("/users", (req, res) => {
    console.log("I am here");
    res.send("Hello from users");
  });
};
