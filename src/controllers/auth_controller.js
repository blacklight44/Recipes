const { validationResult } = require("express-validator"); //validatör hatalar

// const passport = require("passport");
// require("../config/passport_local")(passport);

const loginFormunuGoster = (req, res, next) => {
  res.render("login", {
    layout: "./layout/auth_layout.ejs",
    title: "Giriş Yap",
  });
};

const login = (req, res, next) => {
  const hatalar = validationResult(req);
};

const registerFormunuGoster = (req, res, next) => {
  console.log(req.flash("validation_error"));
  res.render("register", {
    layout: "./layout/auth_layout.ejs",
    title: "Kayıt Ol",
  });
};

const register = async (req, res, next) => {
  const hatalar = validationResult(req); //validationda gelen hatalar
  // console.log(hatalarDizisi);
  if (!hatalar.isEmpty()) {
    //key value olarak hatalar dizisini ve formu değerlerini baştan doldurtmamak için post bodysinden
    //aldığımız girilen bi önceki tüm değerleri flash a ekliyoruz
    req.flash("validation_error", hatalar.array()); //arayüzde ele almak için array a çeviriyoruz
    req.flash("email", req.body.email);
    req.flash("ad", req.body.ad);
    req.flash("soyad", req.body.soyad);
    req.flash("sifre", req.body.sifre);
    req.flash("resifre", req.body.resifre);

    //console.log(req.session);
    //res.render respons sonlandır viewa yolla iken res.redirect respons sonlanmadan tekrar şu soraya git oluyor
    //hata çıktığı durumda responsı tekrar registera yönlendiriyoruz
    //fakat renderdaki gibi parametrelerimizi geçemediğimizden flash kullanıyoruz
    res.redirect("/register"); //registerFormunuGoster e get isteği oluşturuyor
  }
};

const forgetPasswordFormunuGoster = (req, res, next) => {
  res.render("forget_password", {
    layout: "./layout/auth_layout.ejs",
    title: "Şifremi Unuttum",
  });
};
const forgetPassword = async (req, res, next) => {
  res.render("forget_password", { layout: "./layout/auth_layout.ejs" });
};

module.exports = {
  loginFormunuGoster,
  registerFormunuGoster,
  forgetPasswordFormunuGoster,
  register,
  login,
  forgetPassword,
};
