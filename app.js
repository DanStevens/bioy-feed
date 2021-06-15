const express = require("express");
const path = require("path");
var os = require("os");
const app = express();
const PORT = process.env.PORT || 3000;
const ALPHA_API_HOST = process.env.ALPHA_API_HOST || "api.alpha.org";

app.use(express.static(path.join(__dirname, "public")));

const package = require("./package.json");
const alpha = require("./alpha-api");
const client = new alpha.BioyClient(package.name, ALPHA_API_HOST);
const feedifier = new  alpha.BioyEpisodeFeedifier();

// Suffix feed image and icon with request host
feedifier.feedOptions.imageUrl = "//" + os.hostname + feedifier.feedOptions.imageUrl;
feedifier.feedOptions.favicon = "//" + os.hostname + feedifier.feedOptions.favicon;

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

// Assuming Alpha schedules new entries at 2 AM UTC, reset caches just before this
const CACHE_RESET_SCHEDULE = process.env.CACHE_RESET_SCHEDULE || "59 59 1 * * * *";

const schedule = require("node-schedule");
schedule.scheduleJob(CACHE_RESET_SCHEDULE, () => {
  console.log("Resetting caches");
  client.resetCache();
});