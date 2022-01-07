const axios = require("axios");
const cherrio = require("cheerio");
// const TheGuardianModel = require("../../models/news/TheGuardianModel");

//! redis ---------------------------------------------
const redis = require("redis");
const client = redis.createClient();
let allArticles = [];

//! Get Informaion

const DEFAULT_PEXPIRATION = 3600;
const sliceIndex = 8;

exports.list = async (req, res) => {
  client.on("error", (err) => console.log("Redis Client Error", err));
  await client.connect();
  try {
    let value = await client.get("theGuardian");

    if (value != null) {
      await client.quit();
      return res.status(200).json(JSON.parse(value));
    } else {
      const newsURL = "https://www.theguardian.com/uk-news";
      const { data } = await axios.get(newsURL);
      const $ = cherrio.load(data, { scriptingEnabled: false });
      const newsItems = $(".fc-container__inner");

      newsItems.each(async (idx, el) => {
        title = $(el).find(".fc-item__header").find("h3").text();
        url = $(el).find(".fc-item__header").find("h3").find("a").attr("href");
        imgPath = $(el)
          .find(".fc-item__media-wrapper div")
          .find("picture img")
          .attr("src");

        const articleContent = {
          id: idx,
          title: title,
          url: url,
          img: imgPath,
        };

        allArticles.push(articleContent);
      });

      const filterArticles = allArticles.filter(
        (article) => article["img"] != undefined
      );
      const sliceArticles = filterArticles.slice(0, sliceIndex);

      await client.setEx(
        "theGuardian",
        DEFAULT_PEXPIRATION,
        JSON.stringify(sliceArticles)
      );
      await client.quit();
      return res.status(200).json(sliceArticles);
    }
  } catch (err) {
    console.log(err.message);
  }
};
