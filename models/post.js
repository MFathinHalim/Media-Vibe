var _a = require("mongoose"), Schema = _a.Schema, model = _a.model;
var postSchema = new Schema({
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
