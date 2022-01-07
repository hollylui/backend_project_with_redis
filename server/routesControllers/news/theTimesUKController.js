const axios = require("axios");
const cherrio = require("cheerio");
// const newsHelper = require("../../helpers/news/newsHelper");

//! redis ---------------------------------------------

const redis = require("redis");
const client = redis.createClient();

//! Get information ------------------------------------

let allArticles = [];
const DEFAULT_PEXPIRATION = 3600;
const sliceIndex = 8;

exports.list = async (req, res) => {
  client.on("error", (err) => console.log("Redis Client Error", err));
  await client.connect();
  try {
    let value = await client.get("theTimesUK");

    if (value != null) {
      await client.quit();
      return res.status(200).json(JSON.parse(value));
    } else {
      const newsURL = "https://www.thetimes.co.uk";
      const { data } = await axios.get(newsURL);
      const $ = cherrio.load(data, { scriptingEnabled: false });

      const newsItems = $(".T-3 ");
      newsItems.each(async (idx, el) => {
        title = $(el).find(".Item-content").children("h3").text();
        url = newsURL + $(el).find(".Item-content").find("a").attr("href");
        withVideo = $(el).find(".Item-media").find("img").attr("src");
        withoutVideo = $(el)
          .find(".Item-media")
          .find("a")
          .find("div")
          .find("img")
          .attr("src");
        imgPath = withoutVideo === undefined ? withVideo : withoutVideo;

        const articleContent = {
          id: idx,
          title: title,
          url: url,
          img: "https:" + imgPath,
        };

        allArticles.push(articleContent);
      });

      const sliceArticles = allArticles.slice(0, sliceIndex);
      await client.setEx(
        "theTimesUK",
        DEFAULT_PEXPIRATION,
        JSON.stringify(sliceArticles)
      );
      await client.quit();
      return res.status(200).json(sliceArticles);
    }
  } catch (err) {
    return res.status(404).send(err.message);
  }
};
