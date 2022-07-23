const User = require("../model/user_model");
//yönetim controllerdaki tüm sayfalar yönetim_layout üzerinden açılır
//      layout: "./layout/yonetim_layout.ejs"

const anaSayfayiGoster = function (req, res, next) {
  res.render("index", {
    layout: "./layout/yonetim_layout.ejs",
    title: "Yönetim Paneli Ana Sayfa",
  });
};

module.exports = {
  anaSayfayiGoster,
};
