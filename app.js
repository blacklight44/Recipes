const dotenv = require("dotenv").config();
const express = require("express");
const app = express();

//template engine ayarları
const path = require("path");
//ejs nin template engine olarak belirlenmesi
const ejs = require("ejs");
app.set("view engine", "ejs");
//viewin yolunun default halini tanımladık
app.set("views", path.resolve(__dirname, "./src/views"));

//
const expressLayouts = require("express-ejs-layouts");
app.use(expressLayouts);
//
app.use(express.static("public"));

//serverjs
app.listen(process.env.PORT, () => {
  console.log(`Server ${process.env.PORT} portundan ayaklandı`);
});
