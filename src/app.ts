import express from "express";
import bodyParser from "body-parser";

import routesHandler from "./routers/index";
import axios from "axios";

const app = express();

app.use(express.static(`public`));

// Read the request body
app.use(bodyParser.json());

// Handle the routes
app.use("/api/v1", routesHandler());

app.get("/home", (req, res) => {
  const requestToken = req.query.code;
  console.log(requestToken);

  axios({
    method: "post",
    url: `https://github.com/login/oauth/access_token?client_id=${process.env.GITHUB_CLIENT_ID}&client_secret=${process.env.GITHUB_CLIENT_SECRET}&code=${requestToken}`,
    headers: {
      accept: "application/json",
    },
  }).then((response) => {
    const accessToken = response.data.access_token;
    console.log(response);

    // redirect the user to the home page, along with the access token
    res.redirect(`/home.html?access_token=${accessToken}`);
  });
});

export default app;
