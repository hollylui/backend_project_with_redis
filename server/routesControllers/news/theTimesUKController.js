const axios = require("axios");
const cherrio = require("cheerio");
const newsHelper = require("../../helpers/news/newsHelper");

let theTimesUkArticles = [];

//! cheerio funciton ------------------------------------
const cheerioFn = async () => {
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
      title: title,
      url: url,
      img: "https:" + imgPath,
    };

    theTimesUkArticles.push(articleContent);
  });
};

//! Get information ------------------------------------

// List information ------------------------------------------
exports.list = async (req, res) => {
  newsHelper("theTimesUK", res, theTimesUkArticles, cheerioFn);
};
