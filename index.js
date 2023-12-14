"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var dotenv = require("dotenv");
var fs = require("fs");
var multer = require("multer");
var path = require("path");
var ImageKit = require("imagekit");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var mainModel = require("./models/post").mainModel;
var axios = require("axios");
dotenv.config();
var imagekit = new ImageKit({
    publicKey: process.env.publicImg,
    privateKey: process.env.privateImg,
    urlEndpoint: process.env.urlEndpoint,
});
var data;
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/video/uploads");
    },
    filename: function (req, file, cb) {
        cb(null, "video-".concat(data.length + 1, ".mp4"));
    },
});
var upload = multer({ storage: storage });
var app = express();
var port = process.env.PORT || 3000;
// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", __dirname + "/views"); // Specify the directory where your views are located
app.use(express.static(path.join(__dirname, "/public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true,
}));
app.post("/:id/comment", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var entryId, comment, entry;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                entryId = parseInt(req.params.id);
                console.log(entryId);
                comment = req.body.comment;
                entry = data.find(function (item) { return item.id == entryId; });
                if (!entry) {
                    return [2 /*return*/, res.status(404).json({ msg: "Entry not found" })];
                }
                // Add the comment to the entry
                entry.comments.push({ isi: comment });
                // Update MongoDB with the new comment
                return [4 /*yield*/, mainModel.findOneAndUpdate({ id: entryId }, { $push: { comments: { isi: comment } } })];
            case 1:
                // Update MongoDB with the new comment
                _a.sent();
                return [2 /*return*/, res.redirect("/".concat(entryId))];
        }
    });
}); });
app.post("/", upload.single("image"), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var token, response, desc, nama, id, vidLink, comments;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                token = req.body["g-recaptcha-response"];
                return [4 /*yield*/, axios.post("https://www.google.com/recaptcha/api/siteverify?secret=".concat(process.env.GOOGLE_RECAPTCHA_SECRET_KEY, "&response=").concat(token))];
            case 1:
                response = _a.sent();
                if (!response.data.success)
                    return [2 /*return*/, res.json({ msg: "reCAPTCHA tidak valid" })];
                desc = req.body.desc;
                nama = req.body.nama;
                id = data.length + 1;
                vidLink = "https://ik.imagekit.io/9hpbqscxd/MV/video-".concat(id, ".mp4");
                fs.readFile(path.join(__dirname, "/public/video/uploads", "video-" + id + ".mp4"), function (err, data) {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (err)
                                        throw err; // Fail if the file can't be read.
                                    return [4 /*yield*/, imagekit.upload({
                                            file: data, //required
                                            fileName: "video-" + id + ".mp4", //required
                                            useUniqueFileName: false,
                                            folder: "MV",
                                        }, function (error, result) {
                                            if (error)
                                                console.log(error);
                                        })];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    });
                });
                comments = [];
                return [4 /*yield*/, mainModel.create({
                        id: id,
                        nama: nama,
                        desc: desc,
                        vidLink: vidLink,
                        comments: comments,
                    })];
            case 2:
                _a.sent();
                data.unshift({ id: id, nama: nama, desc: desc, vidLink: vidLink, comments: comments });
                res.redirect("/" + id);
                return [2 /*return*/];
        }
    });
}); });
mongoose
    .connect(process.env.MONGODBURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
})
    .then(function () {
    mainModel.find({}, null).then(function (res) {
        data = res;
        app.get("/", function (req, res) {
            res.render("index", {
                data: data,
            }); // Render the "index.ejs" file in the "views" directory
        });
        app.get("/search", function (req, res) {
            var searchTerm = req.query.term; // Dapatkan input pengguna
            var searchResults = data.filter(function (item) {
                return item.nama &&
                    item.nama.toLowerCase().includes(searchTerm.toLowerCase() || "");
            } // Cek keberadaan item.nama sebelum menggunakan includes
            );
            res.render("index", {
                data: searchResults,
            });
        });
        app.get("/:id", function (req, res) {
            var searchTerm = parseInt(req.params.id); // Dapatkan ID dari URL dan ubah ke tipe numerik jika perlu
            console.log(searchTerm);
            var searchResult = data.find(function (entry) { return entry.id == searchTerm; });
            res.render("vid", {
                entry: searchResult,
            });
        });
        app.listen(port, function () {
            console.log("[app]: app is running at http://localhost:".concat(port));
        });
    });
});
