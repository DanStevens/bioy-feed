const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

const package = require("./package.json");
const alpha = require("./alpha-api");
const client = new alpha.BioyClient(package.name);
const feedifier = new  alpha.BioyEpisodeFeedifier();

app.get("/", (req, res) => {
  res.redirect("/feed");
});

app.get("/feed/:start?/:end?/:limit?", (reqLocal, resLocal) => {
  client.listFullCommentaries(reqLocal.params.start || -19, reqLocal.params.end || 0,
    reqLocal.params.limit || 20)
    .then(resRemote => {
      const feed = feedifier.feedify(resRemote);
      // resLocal.type("application/atom+xml");
      // resLocal.send(feed.atom1());
      resLocal.type("text/xml");
      resLocal.send(feed.buildXml());

    })
    .catch(err => {
      //console.error(`Error: (${err.name}) ${err.message}`);
      console.error(err);
    });
});

app.listen(PORT, error => {
  if (error) {
    console.log(`An error occurred: ${error}`);
  } else {
    console.log("express started");
  }
});