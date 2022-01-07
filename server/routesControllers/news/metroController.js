const axios = require("axios");
const cherrio = require("cheerio");

//! redis ---------------------------------------------
const redis = require("redis");
const client = redis.createClient();

//! Get information ------------------------------------

let allArticles = [];
const DEFAULT_PEXPIRATION = 3600;
const sliceIndex = 8;

// List information ------------------------------------------
exports.list = async (req, res) => {
  client.on("error", (err) => console.log("Redis Client Error", err));
  await client.connect();
  try {
    let value = await client.get("metro");

    if (value != null) {
      await client.quit();
      return res.status(200).json(JSON.parse(value));
    } else {
      //cherrio
      const newsURL = "https://metro.co.uk";
      const { data } = await axios.get(newsURL);
      const $ = cherrio.load(data, { scriptingEnabled: false });
      const newsItems = $(".metro__post");

      newsItems.each(async (idx, el) => {
        title = $(el).find("h3").text();
        url = $(el).find("h3").find("a").attr("href");
        imgPath = $(el)
          .find(".metro__post__media")
          .find("a")
          .find("picture img")
          .attr("src");

        const articleContent = {
          title: title,
          url: url,
          img: imgPath,
        };

        allArticles.push(articleContent);
      });

      const sliceArticles = allArticles.slice(0, sliceIndex);
      await client.setEx(
        "metro",
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
