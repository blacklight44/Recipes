const dotenv = require("dotenv").config();
const express = require("express");
const app = express();
const session = require("express-session");
const flash = require("connect-flash");
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
//session ve flash message
// session için mw her istekte session yoksa oluşturuluyor
//flash ve passport.js için gerekli flash kendini session içine kor ve sonra kendini siler
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true, //başlangıçta cookie oluşturması için
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

//flah mesajların middleware olarak kullanılmasını sagladık
app.use(flash());
app.use((req, res, next) => {
  res.locals.validation_error = req.flash("validation_error");
  res.locals.success_message = req.flash("success_message");
  res.locals.email = req.flash("email");
  res.locals.ad = req.flash("ad");
  res.locals.soyad = req.flash("soyad");
  res.locals.sifre = req.flash("sifre");
  res.locals.resifre = req.flash("resifre");

  res.locals.login_error = req.flash("error");

  next();
});

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
