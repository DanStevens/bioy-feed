const request = require("request-promise-native");
const Podcast = require("podcast");
const sha1 = require("hash.js/lib/hash/sha/1");

Date.prototype.addDays = function(days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
};

class BioyClient {
  constructor(userAgent, host = "api.alpha.org") {
    this.host = host.trim();
    this.userAgent = userAgent.trim();
    this._cache = {};
  }

  listFullCommentaries(start, end, limit = 10, language = "en") {
    let now = new Date();
    start = isNaN(Number(start)) ? new Date(start) : now.addDays(Number(start));
    end = isNaN(Number(end)) ? new Date(end) : now.addDays(Number(end));

    let query = `/bioy/2/public/listFullCommentariesByBatch/${language}/${this._d2s(start)}/${this._d2s(end)}/${limit}`;
    return this._request(query);
  }

  resetCache() {
    this._cache = {};
  }

  _d2s(date) {
    return date.toISOString().slice(0, 10);
  }

  _request(query) {
    query = query.trim().replace(/^\//, "/"); // Trim whitespace and leading /"s
    const hash = sha1().update(query).digest("hex");

    // Check cache
    if (this._cache[hash]) {
      console.debug(`Cache hit (${hash})`);
      return this._cache[hash];

    } else {
      console.debug(`Cache miss. Requesting URI https://${this.host}/${query}`);
      let options = {
        uri: `https://${this.host}/${query}`,
        headers: { "User-Agent": this.userAgent },
        json: true
      };
      console.log(`Caching response with key ${hash}`);
      return this._cache[hash] = request(options);
    }
  }
}

class BioyEpisodeFeedifier {

  constructor(feedOptions = null) {
    this.feedOptions = feedOptions || {
      title: "Bible In One Year",
      description: "Start your day with the Bible in One Year, a free Bible reading app with commentary by Nicky and Pippa Gumbel. Nicky Gumbel is the Vicar of HTB in London and pioneer of Alpha.",
      categories: [ "Religion" ],
      id: "https://bibleinoneyear.org/en",
      siteUrl: "https://bibleinoneyear.org/en",
      imageUrl: "/bioy-logo.png",
      favicon: "/bioy-favicon.ico",
      copyright: "© Alpha International",
      author:"Nicky Gumbel",
      ttl: 1440,
      contributors: [
        {
          name: "Nicky Gumbel",
          link: "https://bibleinoneyear.org/en/about/",
        },
        {
          name: "Pippa Gumbel",
          link: "https://bibleinoneyear.org/en/about/",
        }
      ],
    };
  }

  feedify(json) {
    const feed = new Podcast(this.feedOptions);

    json.body.forEach(episode => feed.addItem(this._episodeToFeedItem(episode)));

    return feed;
  }

  _episodeToFeedItem(episode) {
    const episodeUrl = `${this.feedOptions.siteUrl}/classic/${episode.did}`;
    const content =
`${episode.teaser}<a href="${episodeUrl}">More...</a>
<p>Bible readings:</p><ul>
<li>${episode.day.psalm || episode.day.proverbs}</li>
<li>${episode.day.new_testament}</li>
<li>${episode.day.old_testament}</li>
</ul>
`;

    return {
      title: episode.title,
      url: episodeUrl,
      date: new Date(episode.realday),
      published: new Date(episode.scheduled_for),
      // link: episodeUrl,
      // description: episode.teaser,
      description: content,
      // content: content,
      copyright: this.feedOptions.copyright,
      image: this.feedOptions.image,
      author: [ this.feedOptions.author ],
      contributor: this.feedOptions.contributors,
      enclosure: {
        url: episode.audio_path,
        type: "audio/mpeg",
        size: episode.audio_data.length
      }
    };
  }
}

module.exports = { BioyClient, BioyEpisodeFeedifier };