const axios = require("axios");
const cherrio = require("cheerio");
const newsHelper = require("../../helpers/news/newsHelper");

let metroArticles = [];

//! cheerio funciton ------------------------------------
const cheerioFn = async () => {
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

    metroArticles.push(articleContent);
  });
};

//! Get information ------------------------------------
exports.list = async (req, res) => {
  newsHelper("metro", res, metroArticles, cheerioFn);
};
