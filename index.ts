import { Express, Request, Response } from "express";
const express = require("express");
const dotenv = require("dotenv");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const ImageKit = require("imagekit");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const { mainModel } = require("./models/post");
const axios = require("axios");
dotenv.config();

var imagekit = new ImageKit({
  publicKey: process.env.publicImg,
  privateKey: process.env.privateImg,
  urlEndpoint: process.env.urlEndpoint,
});
interface comment {
  isi: string;
}
interface Data {
  id: number;
  nama: string;
  desc: string;
  vidLink: string;
  comments: comment[];
}

var data: Data[];
const storage = multer.diskStorage({
  destination: function (req: Request, file: any, cb: any) {
    cb(null, `public/video/uploads`);
  },
  filename: function (req: Request, file: any, cb: any) {
    cb(null, `video-${data.length + 1}.mp4`);
  },
});
const upload = multer({ storage });

const app: Express = express();
const port: number | string = process.env.PORT || 3000;

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", __dirname + "/views"); // Specify the directory where your views are located
app.use(express.static(path.join(__dirname, "/public")));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.post("/:id/comment", async (req: Request, res: Response) => {
  const entryId = parseInt(req.params.id);
  console.log(entryId);
  const comment = req.body.comment;

  // Find the entry by ID
  const entry = data.find((item) => item.id == entryId);

  if (!entry) {
    return res.status(404).json({ msg: "Entry not found" });
  }

  // Add the comment to the entry
  entry.comments.push({ isi: comment });

  // Update MongoDB with the new comment
  await mainModel.findOneAndUpdate(
    { id: entryId },
    { $push: { comments: { isi: comment } } }
  );

  return res.redirect(`/${entryId}`);
});
app.post("/", upload.single("image"), async (req: Request, res: Response) => {
  const token = req.body["g-recaptcha-response"];
  const response = await axios.post(
    `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.GOOGLE_RECAPTCHA_SECRET_KEY}&response=${token}`
  );
  if (!response.data.success) return res.json({ msg: "reCAPTCHA tidak valid" });
  //TODO first things, we will make the const variable from the req data
  const desc = req.body.desc;
  const nama = req.body.nama;
  const id = data.length + 1;
  const vidLink = `https://ik.imagekit.io/9hpbqscxd/MV/video-${id}.mp4`;
  fs.readFile(
    path.join(__dirname, "/public/video/uploads", "video-" + id + ".mp4"),
    async function (err: any, data: any) {
      if (err) throw err; // Fail if the file can't be read.
      await imagekit.upload(
        {
          file: data, //required
          fileName: "video-" + id + ".mp4", //required
          useUniqueFileName: false,
          folder: "MV",
        },
        function (error: any, result: any) {
          if (error) console.log(error);
        }
      );
    }
  );
  var comments: any = [];
  await mainModel.create({
    id,
    nama,
    desc,
    vidLink,
    comments,
  });
  data.unshift({ id, nama, desc, vidLink, comments });
  res.redirect("/" + id);
});

mongoose
  .connect(process.env.MONGODBURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => {
    mainModel.find({}, null).then((res: Data[]) => {
      data = res;
      app.get("/", (req: Request, res: Response) => {
        res.render("index", {
          data: data,
        }); // Render the "index.ejs" file in the "views" directory
      });
      app.get("/search", function (req: Request, res: Response) {
        const searchTerm: any = req.query.term; // Dapatkan input pengguna
        const searchResults = data.filter(
          (item) =>
            item.nama &&
            item.nama.toLowerCase().includes(searchTerm.toLowerCase() || "") // Cek keberadaan item.nama sebelum menggunakan includes
        );
        res.render("index", {
          data: searchResults,
        });
      });
      app.get("/:id", function (req: Request, res: Response) {
        const searchTerm: number = parseInt(req.params.id); // Dapatkan ID dari URL dan ubah ke tipe numerik jika perlu
        console.log(searchTerm);
        const searchResult = data.find((entry) => entry.id == searchTerm);

        res.render("vid", {
          entry: searchResult,
        });
      });

      app.listen(port, () => {
        console.log(`[app]: app is running at http://localhost:${port}`);
      });
    });
  });
