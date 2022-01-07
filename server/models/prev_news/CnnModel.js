const { Schema, model } = require("mongoose");
const newsSchemaContent = require("../prev_schemaContent/newsSchemaContent");

const cnnSchema = new Schema(newsSchemaContent.newsArticle);

const CnnModel = model("cnns", cnnSchema);

module.exports = CnnModel;
