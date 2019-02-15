const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

const package = require("./package.json");
const alpha = require("./alpha-api");
const client = new alpha.BioyClient(package.name);
const feedifier = new  alpha.BioyEpisodeFeedifier();

app.get("/feed", function(reqLocal, resLocal) {
  client.request("/bioy/2/public/listFullCommentariesByBatch/en/2019-02-01/2019-02-28")
    .then(function(resRemote) {
      const feed = feedifier.feedify(resRemote);
      // resLocal.type("application/atom+xml");
      // resLocal.send(feed.atom1());
      resLocal.type("application/rss+xml");
      resLocal.send(feed.rss2());

    })
    .catch(function (err) {
      //console.error(`Error: (${err.name}) ${err.message}`);
      console.error(err);
    });
});

app.listen(PORT, function(error) {
  if (error) {
    console.log(`An error occurred: ${error}`);
  } else {
    console.log("express started");
  }
});