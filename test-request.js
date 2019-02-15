const package = require("./package.json");
const BioyClient = require("./alpha-api").BioyClient;
const BioyEpisodeFeedifier = require("./alpha-api").BioyEpisodeFeedifier;

let client = new BioyClient(package.name);
let feedifier = new BioyEpisodeFeedifier();
client.request("/bioy/2/public/listFullCommentariesByBatch/en/2019-02-01/2019-02-28")
  .then(function (res) {
    const feed = feedifier.feedify(res);
    //console.log(feed.rss2());
    console.log(feed.atom1());
  })
  .catch(function (err) {
    //console.error(`Error: (${err.name}) ${err.message}`);
    console.error(err);
  });
