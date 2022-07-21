const { validationResult } = require("express-validator"); //validatör hatalar

const passport = require("passport");
require("../config/passport_local")(passport);

const loginFormunuGoster = (req, res, next) => {
  res.render("login", {
    layout: "./layout/auth_layout.ejs",
    title: "Giriş Yap",
  });
};

const login = (req, res, next) => {};
const hatalar = validationResult(req);
// console.log(hatalarDizisi);
const registerFormunuGoster = (req, res, next) => {
  res.render("register", {
    layout: "./layout/auth_layout.ejs",
    title: "Kayıt Ol",
  });
};

const register = async (req, res, next) => {
  const hatalar = validationResult(req); //validationda gelen hatalar
  // console.log(hatalarDizisi);
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
