const dotenv = require("dotenv").config();
const express = require("express");
const app = express();

//template engine ayarları
const path = require("path");
//ejs nin template engine olarak belirlenmesi
const ejs = require("ejs");
const expressLayouts = require("express-ejs-layouts");
app.use(expressLayouts);
app.set("view engine", "ejs");
//viewin yolunun default halini tanımladık
app.set("views", path.resolve(__dirname, "./src/views"));
//
//formdan gelen değerlerin okunabilmesi için
app.use(express.urlencoded({ extended: true }));
//
app.use(express.static("public"));
//db baglantısı
require("./src/config/database");
//
//routerlar include edilir
const authRouter = require("./src/routers/auth_router");
app.use("/", authRouter);
// app.get("/login", (req, res) => {
//   res.render("login", { layout: "./layout/auth_layout.ejs" });
// });

//serverjs
app.listen(process.env.PORT, () => {
  console.log(`Server ${process.env.PORT} portundan ayaklandı`);
});
