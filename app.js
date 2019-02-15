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

app.get("/feed", (reqLocal, resLocal) => {
  client.listFullCommentaries("2019-02-01", "2019-02-28", 31)
    .then(resRemote => {
      const feed = feedifier.feedify(resRemote);
      // resLocal.type("application/atom+xml");
      // resLocal.send(feed.atom1());
      resLocal.type("application/rss+xml");
      resLocal.send(feed.rss2());

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