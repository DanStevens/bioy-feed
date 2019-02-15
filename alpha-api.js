const request = require('request-promise-native');
const Feed = require('feed').Feed;

class BioyClient {
  constructor(userAgent, host = 'api.alpha.org') {
    this.host = host.trim();
    this.userAgent = userAgent.trim()
  }

  request(query) {
    query = query.trim().replace(/^\//, '/'); // Trim whitespace and leading /'s
    let options = {
      uri: `https://${this.host}/${query}`,
      headers: { 'User-Agent': this.userAgent },
      json: true
    };
    return request(options);
  }

  
}

class BioyEpisodeFeedifier {

  constructor(feedOptions = null) {
    this.feedOptions = feedOptions || {
      title: "Bible In One Year",
      description: "Start your day with the Bible in One Year, a free Bible reading app with commentary by Nicky and Pippa Gumbel. Nicky Gumbel is the Vicar of HTB in London and pioneer of Alpha.",
      categories: [ "Religion" ],
      id: "https://www.bibleinoneyear.org/bioy/commentary",
      link: "https://www.bibleinoneyear.org/bioy/commentary",
      image: "https://www.bibleinoneyear.org/sites/all/themes/bioy/images/icon.png",
      favicon: "https://www.bibleinoneyear.org/sites/all/themes/bioy/favicon.ico",
      copyright: "© Alpha International",
      author: {
        name: "Nicky Gumbel",
        link: "https://www.bibleinoneyear.org/about",
      },
      contributors: [
        {
          name: "Nicky Gumbel",
          link: "https://www.bibleinoneyear.org/about",
        },
        {
          name: "Pippa Gumbel",
          link: "https://www.bibleinoneyear.org/about",
        }
      ],
    };
  }

  feedify(json) {
    const feed = new Feed(this.feedOptions);
    feed.categories = this.feedOptions.categories;
    feed.contributors = this.feedOptions.contributors;

    json.body.forEach(episode => feed.addItem(this._episodeToFeedItem(episode)));

    return feed;
  }

  _episodeToFeedItem(episode) {
    return {
      title: episode.title,
      id: `${this.feedOptions.link}/${episode.cid}`,
      date: new Date(episode.scheduled_for),
      published: new Date(episode.scheduled_for),
      link: episode.audio_path,
      // link: `${this.feedOptions.link}/${epsiode.cid}`,
      description: episode.teaser,
      content: episode.teaser,
      copyright: this.feedOptions.copyright,
      image: this.feedOptions.image,
      author: [ this.feedOptions.author ],
      contributor: this.feedOptions.contributors,
    };
  }
}

module.exports = { BioyClient, BioyEpisodeFeedifier };