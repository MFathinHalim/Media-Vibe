const { Schema, model } = require("mongoose");

const postSchema = new Schema({
  id: String,
  nama: String,
  desc: String,
  vidLink: String,
  comments: [
    {
      isi: String,
    },
  ],
});

module.exports = {
  mainModel: model("MV", postSchema),
};
