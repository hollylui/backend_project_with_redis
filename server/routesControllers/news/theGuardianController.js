const axios = require("axios");
const cherrio = require("cheerio");
const newsHelper = require("../../helpers/news/newsHelper");

let theGuardianArticles = [];

//! cheerio funciton ------------------------------------
const cheerioFn = async () => {
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
      title: title,
      url: url,
      img: imgPath,
    };

    theGuardianArticles.push(articleContent);
  });
};

//! Get information ------------------------------------
exports.list = async (req, res) => {
  newsHelper("theGuardian", res, theGuardianArticles, cheerioFn);
};
